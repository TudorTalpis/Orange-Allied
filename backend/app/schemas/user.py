import re
import uuid
from datetime import datetime
from typing import Literal

from pydantic import EmailStr, Field, field_validator

from app.schemas.base import CamelModel

UserRole = Literal["owner", "admin", "member", "viewer"]


def _validate_password_strength(value: str) -> str:
    if not re.search(r"\d", value):
        raise ValueError("Password must contain at least one digit")
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password must contain at least one uppercase letter")
    return value


class UserCreate(CamelModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        return _validate_password_strength(value)


class UserLogin(CamelModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class UserUpdate(CamelModel):
    full_name: str | None = None
    avatar_url: str | None = None
    organisation: str | None = None
    job_title: str | None = None


class UserRead(CamelModel):
    id: uuid.UUID
    full_name: str
    email: str
    avatar_url: str | None = None
    role: UserRole
    organisation: str
    job_title: str | None = None
    created_at: datetime
    last_active_at: datetime | None = None


class AuthSession(CamelModel):
    user: UserRead
    access_token: str
    refresh_token: str
    expires_at: datetime


class ForgotPasswordRequest(CamelModel):
    email: EmailStr


class ForgotPasswordResponse(CamelModel):
    sent: bool = True
