from fastapi import Depends
from fastapi import Cookie
from fastapi import HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth.auth_service import (get_user_by_session)


def get_current_user(
    session_id: str | None = Cookie(None),
    db: Session = Depends(get_db)
):

    if not session_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user = get_user_by_session(db, session_id)

    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return user