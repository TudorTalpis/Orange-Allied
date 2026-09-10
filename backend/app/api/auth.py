from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.user import (
    AuthSession,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    UserCreate,
    UserLogin,
    UserRead,
    UserUpdate,
)

router = APIRouter(prefix="/auth", tags=["auth"])


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
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role="owner",
        organisation="",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _build_session(user)


@router.post("/login", response_model=AuthSession)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> AuthSession:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    return _build_session(user)


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.put("/me", response_model=UserRead)
def update_current_user(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(_payload: ForgotPasswordRequest) -> ForgotPasswordResponse:
    # Email delivery isn't wired up yet. Always report success (regardless of
    # whether the address is registered) so this endpoint never leaks which
    # emails exist in the system.
    return ForgotPasswordResponse(sent=True)
