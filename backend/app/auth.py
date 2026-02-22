from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

# Secrets and configuration (In a real app, use environment variables)
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-development-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

import hashlib

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def _get_prehash(password: str) -> str:
    if not password:
        return ""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def verify_password(plain_password, hashed_password):
    try:
        if not plain_password: return False
        return pwd_context.verify(_get_prehash(plain_password), hashed_password)
    except Exception as e:
        print(f"VERIFY_PASSWORD ERROR: {e}")
        return False

def get_password_hash(password):
    try:
        print(f"DEBUG: Hashing password of type {type(password)}, length {len(password) if password else 0}")
        prehashed = _get_prehash(password)
        return pwd_context.hash(prehashed)
    except Exception as e:
        print(f"GET_PASSWORD_HASH ERROR: {e}")
        raise

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
