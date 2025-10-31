from __future__ import annotations

import datetime
import logging
from urllib.parse import urlparse, urljoin, urlencode

from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse
from starlette.responses import RedirectResponse

from app.auth.auth_service import AuthService
from app.config import settings
from app.db import db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

import base64, json, hmac, hashlib, time, secrets
from typing import Optional, Dict

def _b64u_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")

def _b64u_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)

def _make_state(next_url: str) -> str:
    payload = {
        "nonce": secrets.token_urlsafe(16),
        "iat": int(time.time()),
        "next": next_url,
    }
    body = _b64u_encode(json.dumps(payload).encode())
    sig = hmac.new(settings.SESSION_SECRET.encode(), body.encode(), hashlib.sha256).digest()
    return f"{body}.{_b64u_encode(sig)}"

def _verify_state(state: str, max_age_sec: int = 600) -> Optional[Dict]:
    try:
        body, sig = state.split(".", 1)
        good_sig = _b64u_encode(hmac.new(settings.SESSION_SECRET.encode(), body.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, good_sig):
            return None
        payload = json.loads(_b64u_decode(body))
        if int(time.time()) - int(payload.get("iat", 0)) > max_age_sec:
            return None
        return payload
    except Exception:
        return None

def _safe_frontend_redirect(next_url: str | None) -> str:
    default_target = urljoin(settings.PUBLIC_APP_URL, "/dashboard")
    if not next_url:
        return default_target

    try:
        parsed = urlparse(next_url)
        if not parsed.netloc and next_url.startswith("/"):
            return urljoin(settings.PUBLIC_APP_URL, next_url)

        pu = urlparse(settings.PUBLIC_APP_URL)
        if parsed.scheme == pu.scheme and parsed.netloc == pu.netloc:
            return next_url
    except Exception:
        logger.exception("Failed to validate next redirect url: %r", next_url)

    logger.warning("Discarding unsafe next url: %r", next_url)
    return default_target


@router.get("/google/login")
async def google_login(request: Request, next: str | None = Query(None)):
    oauth = getattr(request.app.state, "oauth", None)
    if oauth is None or not getattr(oauth, "google", None):
        logger.error("OAuth client not initialized on app.state")
        raise HTTPException(status_code=500, detail="OAuth not configured")

    safe_next = _safe_frontend_redirect(next)
    redirect_uri = f"{settings.BACKEND_BASE_URL}/auth/google/callback"

    # create stateless state (signed)
    state = _make_state(safe_next)
    logger.info("Starting Google OAuth login flow; next=%s", safe_next)

    try:
        return await oauth.google.authorize_redirect(request, redirect_uri, state=state)
    except Exception:
        logger.exception("Failed to start Google OAuth authorize_redirect")
        raise HTTPException(status_code=502, detail="Failed to reach Google OAuth") from None
@router.get("/google/callback")
async def google_callback(request: Request):
    oauth = getattr(request.app.state, "oauth", None)
    if oauth is None or not getattr(oauth, "google", None):
        logger.error("OAuth client not initialized on app.state (callback)")
        raise HTTPException(status_code=500, detail="OAuth not configured")

    # read code & state from query
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    if not code or not state:
        logger.error("Missing code/state on OAuth callback")
        raise HTTPException(status_code=400, detail="Malformed OAuth callback")

    # verify our HMAC-signed state (stateless, no session dependency)
    st = _verify_state(state)
    if not st:
        logger.error("Invalid or expired OAuth state")
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    safe_next = _safe_frontend_redirect(st.get("next"))

    # exchange code -> tokens (no session needed)
    try:
        redirect_uri = f"{settings.BACKEND_BASE_URL}/auth/google/callback"
        token = await oauth.google.fetch_access_token(code=code, redirect_uri=redirect_uri)
        logger.info(
            "Google OAuth token received: id_token=%s, access_token=%s",
            "yes" if "id_token" in token else "no",
            "yes" if "access_token" in token else "no",
        )
    except Exception:
        logger.exception("Google token exchange failed")
        raise HTTPException(status_code=400, detail="Google auth failed") from None

    # userinfo
    try:
        userinfo = token.get("userinfo")
        if not userinfo:
            userinfo_endpoint = oauth.google.server_metadata.get("userinfo_endpoint")
            if not userinfo_endpoint:
                raise RuntimeError("No userinfo_endpoint in provider metadata")
            logger.info("Fetching userinfo from %s", userinfo_endpoint)
            resp = await oauth.google.get(userinfo_endpoint, token=token)
            resp.raise_for_status()
            userinfo = resp.json()
    except Exception:
        logger.exception("Failed to retrieve Google userinfo")
        raise HTTPException(status_code=400, detail="Failed to retrieve Google profile") from None

    email = userinfo.get("email")
    name = userinfo.get("name") or ""
    picture = userinfo.get("picture")
    sub = userinfo.get("sub")

    if not email:
        logger.error("Google userinfo missing email; sub=%s", sub)
        raise HTTPException(status_code=400, detail="No email from Google")

    # upsert user
    try:
        user = await db.users.find_one({"email": email})
        if not user:
            await db.users.insert_one({
                "email": email,
                "name": name,
                "google_sub": sub,
                "profile_pic": picture,
                "provider": "google",
                "created_at":  datetime.datetime.utcnow(),
                "is_admin": 0
            })
            user = await db.users.find_one({"email": email})
            logger.info("Created local user for Google email=%s", email)
    except Exception:
        logger.exception("DB error while upserting Google user email=%s", email)
        raise HTTPException(status_code=500, detail="Internal error (user save)") from None

    # issue app JWT & redirect to frontend with tokens in query params
    try:
        access_token = AuthService.create_token({"sub": str(user["_id"]), "email": user["email"], "provider": "google"})
        refresh_token = AuthService.create_refresh_token({"sub": str(user["_id"]), "email": user["email"], "provider": "google"})
        # Build redirect URL to frontend
        frontend_url = _safe_frontend_redirect(st.get("next"))
        params = urlencode({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "email": user["email"],
            "name": user["name"],
            "id": str(user["_id"]),
            "is_admin": user.get("is_admin", 0)
        })
        redirect_url = f"{frontend_url}?{params}"
        return RedirectResponse(redirect_url)
    except Exception:
        logger.exception("Failed to build response for SPA")
        raise HTTPException(status_code=500, detail="Internal error (response)") from None
