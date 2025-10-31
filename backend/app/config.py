# app/config.py (or wherever your Settings class lives)
from pydantic_settings import BaseSettings
from pydantic import EmailStr
from app.utils import constants

class Settings(BaseSettings):
    # existing
    MONGO_URI: str
    PUBLIC_APP_URL: str
    APP_NAME: str 
    LOGO_URL: str | None = None
    BACKEND_BASE_URL: str
    
    MAIL_USERNAME: str | None = None
    MAIL_PASSWORD: str | None = None
    MAIL_FROM: EmailStr
    MAIL_FROM_NAME: str = "Your App"
    MAIL_SERVER: str
    MAIL_PORT: int = 587
    MAIL_TLS: bool = True           
    MAIL_SSL: bool = False         
    MAIL_SUPPRESS_SEND: bool = False
    MAIL_VALIDATE_CERTS: bool = True
    SUPPORT_EMAIL: EmailStr | None = None

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    SESSION_SECRET: str
    MISTRAL_API_KEY: str
    class Config:
        env_file = constants.ENV_FILE

settings = Settings()
