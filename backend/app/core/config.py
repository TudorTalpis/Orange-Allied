from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/core/config.py -> repository root. Inside the container this
# resolves to a path that does not exist, which is fine: there the values come
# from the environment that docker compose injects.
ROOT_DIR = Path(__file__).resolve().parents[3]

# An empty or trivial signing key means anyone can mint a valid token for any
# user, so the application refuses to start instead of running unprotected.
JWT_SECRET_MIN_LENGTH = 32


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ROOT_DIR / ".env"), extra="ignore")

    DATABASE_URL: str

    JWT_SECRET_KEY: str = Field(min_length=JWT_SECRET_MIN_LENGTH)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30


settings = Settings()
