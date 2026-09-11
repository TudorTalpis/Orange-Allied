"""Test setup.

Tests run against a real PostgreSQL database (the models rely on Postgres
types), in a separate `*_test` database so the development data is untouched.
The database URL is redirected *before* application modules are imported, so
settings, the engine and Alembic all pick up the test database on their own.
"""
import os
from pathlib import Path

import pytest
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

BACKEND_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BACKEND_DIR.parent

load_dotenv(ROOT_DIR / ".env")

_source_url = os.environ.get("DATABASE_URL")
if not _source_url:
    raise RuntimeError("DATABASE_URL must be set (see .env.example) to run the tests")

_server_url, _database_name = _source_url.rsplit("/", 1)
TEST_DATABASE_NAME = f"{_database_name}_test"
TEST_DATABASE_URL = f"{_server_url}/{TEST_DATABASE_NAME}"

os.environ["DATABASE_URL"] = TEST_DATABASE_URL


def _create_test_database() -> None:
    # CREATE DATABASE cannot run inside a transaction, and cannot run from a
    # connection to the database being created, so connect to `postgres`.
    admin_engine = create_engine(f"{_server_url}/postgres", isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as connection:
        exists = connection.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {"name": TEST_DATABASE_NAME},
        ).scalar()
        if not exists:
            connection.execute(text(f'CREATE DATABASE "{TEST_DATABASE_NAME}"'))
    admin_engine.dispose()


@pytest.fixture(scope="session", autouse=True)
def prepare_database() -> None:
    _create_test_database()

    from alembic import command
    from alembic.config import Config

    alembic_config = Config(str(BACKEND_DIR / "alembic.ini"))
    alembic_config.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    command.upgrade(alembic_config, "head")


@pytest.fixture(autouse=True)
def clean_users(prepare_database: None):
    """Give every test an empty users table."""
    from app.core.database import engine

    with engine.begin() as connection:
        connection.execute(text("TRUNCATE TABLE users"))
    yield
    with engine.begin() as connection:
        connection.execute(text("TRUNCATE TABLE users"))


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from main import app

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def registered_user(client) -> dict:
    """A registered account plus its session payload."""
    credentials = {
        "fullName": "Ada Lovelace",
        "email": "ada@example.com",
        "password": "Parola123",
    }
    response = client.post("/auth/register", json=credentials)
    assert response.status_code == 201, response.text
    return {"credentials": credentials, "session": response.json()}
