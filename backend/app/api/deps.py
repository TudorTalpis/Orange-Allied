import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token, token_is_revoked
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)

# How stale last_active_at may get before it is rewritten. Without a threshold
# every authenticated request would issue a write.
ACTIVITY_REFRESH_INTERVAL = timedelta(minutes=5)


def _touch_last_active(db: Session, user: User) -> None:
    now = datetime.now(timezone.utc)
    if user.last_active_at is not None and now - user.last_active_at < ACTIVITY_REFRESH_INTERVAL:
        return

    try:
        user.last_active_at = now
        db.commit()
    except SQLAlchemyError:
        # Activity tracking is not worth failing an otherwise valid request.
        db.rollback()


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    try:
        payload = decode_access_token(credentials.credentials)
        subject = payload.get("sub")
        if subject is None:
            raise credentials_exception
        user_id = uuid.UUID(subject)
    except (JWTError, ValueError, TypeError) as exc:
        raise credentials_exception from exc

    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    if token_is_revoked(payload, user.tokens_valid_from):
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    _touch_last_active(db, user)
    return user
