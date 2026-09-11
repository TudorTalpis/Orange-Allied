import uuid

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=False, server_default="")
    role: Mapped[str] = mapped_column(String, nullable=False, server_default="owner")
    organisation: Mapped[str] = mapped_column(String, nullable=False, server_default="")
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    job_title: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    last_active_at: Mapped[object | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Logging out sets this to the current time: tokens issued earlier stop
    # being accepted, which is how stateless JWTs are revoked without keeping a
    # list of every token ever issued.
    tokens_valid_from: Mapped[object | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Brute-force protection for the login endpoint.
    failed_login_attempts: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    locked_until: Mapped[object | None] = mapped_column(DateTime(timezone=True), nullable=True)
