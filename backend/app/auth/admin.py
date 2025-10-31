from pymongo import MongoClient
from datetime import datetime
from app.auth.auth_service import AuthService
import logging
from app.db import db

logger = logging.getLogger(__name__)


def create_admin_user():
  

    admin_email = "livingwithelevation@gmail.com"
    admin_password = "admin@123"
    admin_name = "Admin"

    existing = db.users.find_one({"email": admin_email})
    if existing:
        logger.info("Admin user already exists.")
    else:
        user_doc = {
            "email": admin_email,
            "password": AuthService.hash_password(admin_password),
            "name": admin_name,
            "created_at": datetime.utcnow(),
            "is_admin": 1
        }
        db.users.insert_one(user_doc)
        logger.info("Admin user created successfully.")