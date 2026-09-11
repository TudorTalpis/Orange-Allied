import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    token_is_revoked,
    verify_password,
    waste_password_comparison,
)
from app.models.user import User
from app.schemas.user import (
    AuthSession,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    RefreshRequest,
    UserCreate,
    UserLogin,
    UserRead,
    UserUpdate,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# Failed logins are counted per account. Unknown emails are not tracked, so this
# slows down an attack on a known account rather than blind email guessing.
MAX_FAILED_LOGIN_ATTEMPTS = 10
LOGIN_LOCKOUT_DURATION = timedelta(minutes=15)


def _build_session(user: User) -> AuthSession:
    access_token, expires_at = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    return AuthSession(
        user=UserRead.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token,
        expires_at=expires_at,
    )


@router.post("/register", response_model=AuthSession, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> AuthSession:
    email_taken = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
    )

    if db.query(User).filter(User.email == payload.email).first():
        raise email_taken

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        # TODO: every account is currently created as its own owner; roles and
        # organisations are not managed yet.
        role="owner",
        organisation="",
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        # Two simultaneous registrations can both pass the check above; the
        # unique index is what actually decides, so report it as a conflict
        # rather than a server error.
        db.rollback()
        raise email_taken from exc

    db.refresh(user)
    return _build_session(user)


@router.post("/login", response_model=AuthSession)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> AuthSession:
    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
    )

    user = db.query(User).filter(User.email == payload.email).first()
    if user is None:
        waste_password_comparison()
        raise invalid_credentials

    now = datetime.now(timezone.utc)
    if user.locked_until is not None and user.locked_until > now:
        retry_after = int((user.locked_until - now).total_seconds())
        # Telling a locked-out user why they cannot get in does reveal that the
        # account exists; being unable to explain the lockout is the worse of
        # the two problems here.
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Try again later.",
            headers={"Retry-After": str(retry_after)},
        )

    if not verify_password(payload.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= MAX_FAILED_LOGIN_ATTEMPTS:
            user.failed_login_attempts = 0
            user.locked_until = now + LOGIN_LOCKOUT_DURATION
        db.commit()
        raise invalid_credentials

    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_active_at = now
    db.commit()
    db.refresh(user)
    return _build_session(user)


@router.post("/refresh", response_model=AuthSession)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> AuthSession:
    invalid_token = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
    )

    try:
        claims = decode_refresh_token(payload.refresh_token)
        subject = claims.get("sub")
        if subject is None:
            raise invalid_token
        user_id = uuid.UUID(subject)
    except (JWTError, ValueError, TypeError) as exc:
        raise invalid_token from exc

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise invalid_token
    if token_is_revoked(claims, user.tokens_valid_from):
        raise invalid_token

    return _build_session(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    # Stateless tokens cannot be deleted, so every token issued so far is
    # invalidated instead. This signs the account out on all devices.
    current_user.tokens_valid_from = datetime.now(timezone.utc)
    db.commit()


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.put("/me", response_model=UserRead)
def update_current_user(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    # exclude_none: an explicit null means "leave unchanged". Without it,
    # {"fullName": null} would violate the column's NOT NULL constraint.
    for field, value in payload.model_dump(exclude_unset=True, exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(_payload: ForgotPasswordRequest) -> ForgotPasswordResponse:
    # TODO: email delivery is not implemented yet — nothing is actually sent.
    # Always reports success (regardless of whether the address is registered)
    # so the endpoint never leaks which emails exist in the system.
    return ForgotPasswordResponse(sent=True)
