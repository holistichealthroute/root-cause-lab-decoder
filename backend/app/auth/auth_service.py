from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
import uuid
from app.utils import constants
from fastapi import HTTPException

class AuthService:
    _pwd_context = CryptContext(
        schemes=["bcrypt_sha256", "bcrypt"],  # bcrypt_sha256 first
        deprecated="auto",
    )

    @staticmethod
    def hash_password(password: str) -> str:
        return AuthService._pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_pw: str, hashed_pw: str) -> bool:
        return AuthService._pwd_context.verify(plain_pw, hashed_pw)

    @staticmethod
    def create_token(data: dict, expires_minutes: int = constants.TOKEN_EXPIRE_MINUTES):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, constants.JWT_SECRET, algorithm=constants.JWT_ALGORITHM)

    @staticmethod
    def decode_token(token: str):
        try:
            return jwt.decode(token, constants.JWT_SECRET, algorithms=[constants.JWT_ALGORITHM])
        except jwt.PyJWTError:
            return None

    @staticmethod
    def create_reset_token(email: str) -> dict:
        """
        Returns dict with {token, jti, exp(dt)} for password reset.
        """
        jti = str(uuid.uuid4())
        exp_dt = datetime.utcnow() + timedelta(minutes=constants.TOKEN_EXPIRE_MINUTES)
        payload = {"sub": email, "jti": jti, "typ": "pwd_reset", "exp": exp_dt}
        token = jwt.encode(payload, constants.JWT_SECRET, algorithm=constants.JWT_ALGORITHM)
        return {"token": token, "jti": jti, "exp": exp_dt}

    @staticmethod
    def verify_reset_token(token: str) -> tuple[str, str]:
        """
        Validates token signature/expiry/type and returns (email, jti).
        """
        try:
            payload = jwt.decode(token, constants.JWT_SECRET, algorithms=[constants.JWT_ALGORITHM])
            if payload.get("typ") != "pwd_reset":
                raise HTTPException(status_code=400, detail="Invalid reset token type")
            return payload["sub"], payload["jti"]
        except JWTError:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    @staticmethod
    def create_refresh_token(data: dict, expires_minutes: int = constants.REFRESH_TOKEN_EXPIRE_MINUTES):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
        to_encode.update({
            "exp": expire,
            "typ": "refresh"
        })
        return jwt.encode(to_encode, constants.JWT_SECRET, algorithm=constants.JWT_ALGORITHM)

    @staticmethod
    def verify_refresh_token(token: str):
        try:
            payload = jwt.decode(token, constants.JWT_SECRET, algorithms=[constants.JWT_ALGORITHM])
            if payload.get("typ") != "refresh":
                raise HTTPException(status_code=401, detail="Invalid refresh token type")
            return payload
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")