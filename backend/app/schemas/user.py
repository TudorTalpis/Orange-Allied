import re
import uuid
from datetime import datetime
from typing import Annotated, Literal

from pydantic import AfterValidator, EmailStr, Field, field_validator

from app.schemas.base import CamelModel

UserRole = Literal["owner", "admin", "member", "viewer"]

# bcrypt only looks at the first 72 bytes of a password. Anything longer is
# ignored silently, so it is rejected up front instead of pretending to be part
# of the secret.
PASSWORD_MAX_BYTES = 72

NAME_MAX_LENGTH = 120
URL_MAX_LENGTH = 2048


def _normalize_email(value: str) -> str:
    # Addresses are stored and compared lowercased, so Vasilii@pupkin.com and
    # vasilii@pupkin.com are the same account instead of two (or a failed login).
    return value.strip().lower()


NormalizedEmail = Annotated[EmailStr, AfterValidator(_normalize_email)]


def _validate_password_strength(value: str) -> str:
    if len(value.encode("utf-8")) > PASSWORD_MAX_BYTES:
        raise ValueError(f"Password must be at most {PASSWORD_MAX_BYTES} bytes long")
    if not re.search(r"\d", value):
        raise ValueError("Password must contain at least one digit")
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password must contain at least one uppercase letter")
    return value


class UserCreate(CamelModel):
    full_name: str = Field(min_length=1, max_length=NAME_MAX_LENGTH)
    email: NormalizedEmail
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        return _validate_password_strength(value)


class UserLogin(CamelModel):
    email: NormalizedEmail
    password: str
    remember_me: bool = False


class UserUpdate(CamelModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=NAME_MAX_LENGTH)
    avatar_url: str | None = Field(default=None, max_length=URL_MAX_LENGTH)
    organisation: str | None = Field(default=None, max_length=NAME_MAX_LENGTH)
    job_title: str | None = Field(default=None, max_length=NAME_MAX_LENGTH)


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


class RefreshRequest(CamelModel):
    refresh_token: str


class ForgotPasswordRequest(CamelModel):
    email: NormalizedEmail


class ForgotPasswordResponse(CamelModel):
    sent: bool = True
