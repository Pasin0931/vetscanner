from dotenv import load_dotenv
import os
import secrets

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from model import Users, UserSession

load_dotenv()

SESSION_EXPIRE_DAYS = int(
    os.getenv("SESSION_EXPIRE_DAYS", 7)
)


def get_or_create_user(
    db: Session,
    email: str,
    name: str,
    provider_id: str
):
    user = (
        db.query(Users)
        .filter(Users.email == email)
        .first()
    )

    if user:
        return user

    user = Users(
        email=email,
        name=name,
        provider="google",
        provider_id=provider_id
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def create_session(
    db: Session,
    user_id: str
):
    session_id = secrets.token_urlsafe(32)

    session = UserSession(
        id=session_id,
        user_id=user_id,
        expires_at=datetime.utcnow()
        + timedelta(days=SESSION_EXPIRE_DAYS)
    )

    db.add(session)
    db.commit()

    return session_id


def get_user_by_session(
    db: Session,
    session_id: str
):
    session = (
        db.query(UserSession)
        .filter(UserSession.id == session_id)
        .first()
    )

    if not session:
        return None

    if session.expires_at < datetime.utcnow():
        return None

    user = (
        db.query(Users)
        .filter(Users.id == session.user_id)
        .first()
    )

    return user


def delete_session(
    db: Session,
    session_id: str
):
    (
        db.query(UserSession)
        .filter(UserSession.id == session_id)
        .delete()
    )

    db.commit()