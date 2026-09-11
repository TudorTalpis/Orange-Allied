from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.core.database import get_db

app = FastAPI(title="Orange Allied API")
app.include_router(auth_router)
app.include_router(users_router)


@app.get("/health")
def health(db: Session = Depends(get_db)) -> dict[str, str]:
    """Report readiness, database included.

    The API is useless without the database, so answering "ok" while it is
    unreachable would hide exactly the failure this endpoint exists to catch.
    """
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        ) from exc

    return {"status": "ok", "database": "ok"}
