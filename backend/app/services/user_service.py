from fastapi import HTTPException
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from app.auth.auth_service import AuthService
from app.db import db
from bson import ObjectId

import logging

logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = AuthService.decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            logger.info(f"User not found against id:{user_id}")
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except Exception as ex:
        logger.info(f"Error occurred while fetching user against id ",ex)
        raise HTTPException(status_code=401, detail="Invalid token")

async def update_user_profile(user_id: str, name: str = None, gender: str = None, profile_pic: str = None):
    try:
        # Only include fields that are not None and not empty strings
        update_fields = {}
        if name is not None and name != "":
            update_fields["name"] = name
        if gender is not None and gender != "":
            update_fields["gender"] = gender
        if profile_pic is not None and profile_pic != "":
            update_fields["profile_pic"] = profile_pic

        if not update_fields:
            logger.info(f"No fields to update for user_id: {user_id}")
            raise HTTPException(status_code=400, detail="No fields to update")

        user = await db.users.find_one({"_id": ObjectId(user_id)})
       
        if not user:
            logger.info(f"User not found for update, user_id: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )
        logger.info(f"User profile updated for user_id: {user_id}")
        return {"message": "Profile updated successfully"}
    except Exception as ex:
        logger.error(f"Error updating user profile for user_id: {user_id} - {ex}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

