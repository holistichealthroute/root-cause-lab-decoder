from fastapi import APIRouter, HTTPException
from datetime import datetime
from fastapi import Request, APIRouter, HTTPException, Depends
from app.services.user_service import get_current_user, update_user_profile
from bson import ObjectId
from pydantic import BaseModel

from .schemas import  SignupRequest, LoginRequest, TokenResponse, OkResponse, ForgotPasswordRequest, ResetPasswordRequest
from .auth_service import AuthService
from app.db import db
from app.config import settings
from app.services.email_service import EmailService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


def get_email_service(request: Request) -> EmailService:
    return request.app.state.email_service 

@router.post("/signup")
async def signup(data: SignupRequest):
    user = await db.users.find_one({"email": data.email})
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    try:
        user_doc = {
            "email": data.email,
            "password": AuthService.hash_password(data.password),
            "name": data.name,
            "created_at": datetime.utcnow(),
            "is_admin":0
        }
    except Exception as e:
        logger.exception("Error hashing password for email=%s: %s", data.email, e)
        raise HTTPException(status_code=500, detail="Internal error (hashing)")
    await db.users.insert_one(user_doc)
    return {"message": "Signup successful"}

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    
    user = await db.users.find_one({"email": data.email})
    if not user:
        logger.info("User not found for email=%s", data.email)
        raise HTTPException(status_code=401, detail="User not found")
        
    if not AuthService.verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = AuthService.create_token({"sub": str(user["_id"]), "email": user["email"]})
    refresh_token = AuthService.create_refresh_token({"sub": str(user["_id"]), "email": user["email"]})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "email": user["email"],
            "name": user["name"],
            "id": str(user["_id"]),
            "is_admin": user.get("is_admin", 0)
        }
    }


@router.post("/forgot-password", response_model=OkResponse)
async def forgot_password(data: ForgotPasswordRequest,  email_service: EmailService = Depends(get_email_service)):
    """
    Always 200 to prevent email enumeration.
    If user exists: create one-time, time-limited reset token;
    store token metadata; send email with reset link.
    """
    user = await db.users.find_one({"email": data.email})
    if user:
        try:
            token_info = AuthService.create_reset_token(data.email)
            logger.info("Created password reset token")
            await db.password_resets.insert_one({
                "email": data.email,
                "jti": token_info["jti"],
                "expires_at": token_info["exp"],
                "used": False,
                "created_at": datetime.utcnow(),
            })
            logger.info("added password reset record to db  ")
            
            reset_url = f"{settings.PUBLIC_APP_URL}/reset-password?token={token_info['token']}"
            await email_service.send_password_reset(to_email=data.email, reset_url=reset_url)
            logger.info("email sent") 

        except Exception:
            logger.exception("Failed to create reset token for email=%s", data.email)
            raise HTTPException(status_code=500, detail="Internal error (token)")
        return {"ok": True}
    else:
        raise HTTPException(status_code=400, detail="Email not found!")

@router.post("/reset-password", response_model=OkResponse)
async def reset_password(data: ResetPasswordRequest):
    """
    Verify token, ensure it's not used/expired, update user password,
    and mark token as used.
    """
    logger.info("resetting password")
    email, jti = AuthService.verify_reset_token(data.token)
    logger.info("Reset token verified for email=%s jti=%s", email, jti)
    rec = await db.password_resets.find_one({"email": email, "jti": jti})
    if not rec:
        raise HTTPException(status_code=400, detail="Invalid reset token")
    if rec.get("used"):
        raise HTTPException(status_code=400, detail="Reset link already used")
    if rec.get("expires_at") and rec["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset link expired")
    
    logger.info("Reset token valid and unused for email=%s jti=%s", email, jti)
    # Update user password
    logger.info(data.new_password)
    new_hash = AuthService.hash_password(data.new_password)
    logger.info("Password hash created")
    result = await db.users.update_one({"email": email}, {"$set": {"password": new_hash}})
    logger.info("Password updated in db for email=%s", email)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    # Mark token as used
    await db.password_resets.update_one(
        {"_id": rec["_id"]},
        {"$set": {"used": True, "used_at": datetime.utcnow()}}
    )
    logger.info("Marked reset token as used for email=%s jti=%s", email, jti)
    return {"ok": True}

@router.get("/user")
async def get_user(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one(
        {"_id": ObjectId(user_id)},
        {"_id": 1, "name": 1, "email": 1, "gender": 1, "profile_pic": 1,"is_admin":1} )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    logger.info("Fetched user profile for user_id=%s", user)
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "gender": user.get("gender"),
        "profile_pic": user.get("profile_pic"),
        "is_admin": user.get("is_admin", 0)
    }

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest):
    try:
        payload = AuthService.verify_refresh_token(data.refresh_token)
        user_id = payload.get("sub")
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        # Create new access token (and optionally a new refresh token)
        access_token = AuthService.create_token({"sub": str(user["_id"]), "email": user["email"]})
        # Optionally: create a new refresh token
        new_refresh_token = AuthService.create_refresh_token({"sub": str(user["_id"]), "email": user["email"]})
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user["name"]
            }
        }
    except Exception as e:
        logger.error("Error refreshing token: %s", e)
        raise HTTPException(status_code=401, detail="Invalid refresh token")

class UpdateUserProfileRequest(BaseModel):
    name: str | None = None
    gender: str | None = None
    profile_pic: str | None = None

@router.post("/update-profile")
async def update_profile(
    data: UpdateUserProfileRequest,
    user_id=Depends(get_current_user)
):
    try:
        return await update_user_profile(
            user_id=user_id,
            name=data.name,
            gender=data.gender,
            profile_pic=data.profile_pic
        )
    except HTTPException as e:
        raise e
    except Exception as ex:
        logger.error(f"Unexpected error in update_profile: {ex}")
        raise HTTPException(status_code=500, detail="Internal server error")

