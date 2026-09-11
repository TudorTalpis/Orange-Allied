from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

REFRESH_TOKEN_EXPIRE_DAYS = 7

ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"

# Verifying a password is deliberately slow, so logging in with an unknown
# email must do the same work as a real one — otherwise response times reveal
# which emails are registered.
_DUMMY_PASSWORD_HASH = pwd_context.hash("dummy-password-for-constant-time-login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def waste_password_comparison() -> None:
    """Spend the same time as a real password check, for unknown emails."""
    pwd_context.verify("wrong-password", _DUMMY_PASSWORD_HASH)


def _create_token(subject: str, expires_delta: timedelta, token_type: str) -> tuple[str, datetime]:
    issued_at = datetime.now(timezone.utc)
    expire = issued_at + expires_delta
    # iat lets the API reject tokens issued before the user logged out. It is
    # written with sub-second precision (RFC 7519 allows a fractional
    # NumericDate) so that logging out and straight back in within the same
    # second still works.
    payload = {
        "sub": subject,
        "exp": expire,
        "iat": issued_at.timestamp(),
        "type": token_type,
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, expire


def create_access_token(subject: str) -> tuple[str, datetime]:
    return _create_token(
        subject, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), ACCESS_TOKEN_TYPE
    )


def create_refresh_token(subject: str) -> str:
    token, _ = _create_token(
        subject, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS), REFRESH_TOKEN_TYPE
    )
    return token


def _decode_token(token: str, expected_type: str) -> dict:
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    if payload.get("type") != expected_type:
        raise JWTError(f"Expected a {expected_type} token")
    return payload


def decode_access_token(token: str) -> dict:
    """Decode an access token.

    Rejects refresh tokens: they live far longer, so accepting them here would
    silently extend the access token lifetime to the refresh lifetime.
    """
    return _decode_token(token, ACCESS_TOKEN_TYPE)


def decode_refresh_token(token: str) -> dict:
    return _decode_token(token, REFRESH_TOKEN_TYPE)


def token_is_revoked(claims: dict, tokens_valid_from: datetime | None) -> bool:
    """Whether this token predates the user's last logout."""
    if tokens_valid_from is None:
        return False

    issued_at = claims.get("iat")
    if issued_at is None:
        # Tokens minted before iat existed cannot be placed in time, so they are
        # treated as revoked rather than trusted.
        return True

    return datetime.fromtimestamp(issued_at, tz=timezone.utc) < tokens_valid_from
