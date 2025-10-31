import importlib
from app.services import email_patch as _fix_fastapi_mail


importlib.reload(_fix_fastapi_mail)  

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth

from app.config import settings
from app.auth.router import router as auth_router
from app.utils.logger import setup_logging


import logging

setup_logging()
logger = logging.getLogger(__name__)
app = FastAPI(servers=[{"url": "http://127.0.0.1:8000"}])

app.add_middleware(SessionMiddleware, secret_key=settings.SESSION_SECRET)

oauth = OAuth()
oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)
app.state.oauth = oauth



app.add_middleware(
    CORSMiddleware,
   allow_origins=["https://root-cause-lab-decoder-production.up.railway.app"],         
    allow_methods=["*"],            
    allow_headers=["*"],            
)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET,  # long stable value in .env
    same_site="lax",     # lets cookies flow on top-level redirects
    https_only=False,    # dev over http
    session_cookie="app_session",
    max_age=3600,
)
from app.services.email_service import EmailService
from app.auth.google_routes import router as google_router
from app.auth.report_router import router as report_router
from app.auth.supplements_router import router as supplements_router
from app.auth.functional_ranges_router import router as ranges_router
from app.auth.ocr_router import router as ocr_router

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(google_router)
app.include_router(report_router, prefix="/report")
app.include_router(ranges_router, prefix="/functional_ranges")
app.include_router(supplements_router, prefix="/supplements")
app.include_router(ocr_router , prefix="/ocr")


@app.on_event("startup")
async def _startup():
    logger.info("MAIL server=%s port=%s from=%s suppress=%s",
                settings.MAIL_SERVER, settings.MAIL_PORT,
                settings.MAIL_FROM, settings.MAIL_SUPPRESS_SEND)
    app.state.email_service = EmailService()
@app.get("/")
def read_root():
    return {"message": "Welcome to Bloodwork AI API!"}

