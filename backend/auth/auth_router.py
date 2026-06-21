from dotenv import load_dotenv
import os
from fastapi import APIRouter, Depends, Request, Cookie, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import (
    RedirectResponse,
    JSONResponse
)
from database import get_db
from auth.oauth import oauth
from auth.auth_service import (
    get_or_create_user,
    create_session,
    delete_session
)
from auth.auth_dependency import get_current_user
from model import RegisterRequest, LoginRequest, Users as User
from auth.util import hash_password, verify_password

from typing import Optional

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")

router = APIRouter()


@router.get("/google/login")
async def google_login(
    request: Request
):
    redirect_uri = request.url_for(
        "google_callback"
    )

    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get(
    "/google/callback",
    name="google_callback"
)
async def google_callback(request: Request, db: Session = Depends(get_db)):

    token = (
        await oauth.google.authorize_access_token(request)
    )

    userinfo = token["userinfo"]

    user = get_or_create_user(
        db=db,
        email=userinfo["email"],
        name=userinfo["name"],
        provider_id=userinfo["sub"]
    )

    session_id = create_session(db, user.id)

    response = RedirectResponse(url=FRONTEND_URL)

    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800
    )

    return response


@router.post("/logout")
def logout(
    session_id: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
):

    if session_id:
        delete_session(db, session_id)

    response = JSONResponse(
        {
            "message": "logout success"
        }
    )

    response.delete_cookie("session_id")

    return response

@router.post("/register")
def register(
    body: RegisterRequest,
    db: Session = Depends(get_db)
):
    user = User(
        email=body.email,
        name=body.name,
        password=hash_password(body.password),
        provider="local"
    )

    db.add(user)
    db.commit()

    return {
        "message": "register success"
    }

@router.post("/login")
def login(
    body: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == body.email)
        .first()
    )

    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")

    if not verify_password(body.password, user.password): 
        raise HTTPException(status_code=401, detail="invalid credentials")

    session_id = create_session(db, user.id)

    response = JSONResponse(
        {
            "message": "login success"
        }
    )

    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800
    )

    return response

@router.get("/me")
def me(
    current_user=Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name
    }