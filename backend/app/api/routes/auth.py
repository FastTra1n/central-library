import random
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from jose import JWTError, jwt
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from app.db.session import get_session
from app.models.role import Role
from app.models.user import User
from app.schemas.auth import (
    AuthLogin,
    AuthLoginResponse,
    AuthLogoutResponse,
    AuthMeResponse,
    AuthRefreshResponse,
    AuthRegister,
    AuthRegisterResponse,
    AuthUserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _build_user_response(user: User) -> AuthUserResponse:
    return AuthUserResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role_id=user.role_id,
        card_number=user.card_number,
        phone=user.phone,
        hall_id=user.hall_id,
        birth_date=user.birth_date,
        education=user.education,
    )


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.refresh_token_exp_days * 24 * 60 * 60,
        path="/api/auth",
    )


async def _generate_unique_card_number(session: AsyncSession) -> str:
    for _ in range(10):
        card_number = str(random.randint(10000000, 99999999))
        result = await session.execute(
            select(User.id).where(User.card_number == card_number)
        )
        if result.scalar() is None:
            return card_number
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unable to generate card number",
    )


async def _get_reader_role(session: AsyncSession) -> Role:
    result = await session.execute(select(Role).where(Role.name == "Reader"))
    role = result.scalars().first()
    if role:
        return role

    role = Role(name="Reader")
    session.add(role)
    await session.commit()
    await session.refresh(role)
    return role


@router.post(
    "/register",
    response_model=AuthRegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_user(
    payload: AuthRegister,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> Any:
    result = await session.execute(select(User).where(User.email == payload.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if payload.phone:
        result = await session.execute(select(User).where(User.phone == payload.phone))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Phone already registered")

    role = await _get_reader_role(session)
    card_number = await _generate_unique_card_number(session)

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password=get_password_hash(payload.password),
        role_id=role.id,
        card_number=card_number,
        phone=payload.phone,
        hall_id=payload.hall_id,
        birth_date=payload.birth_date,
        education=payload.education,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    _set_refresh_cookie(response, refresh_token)

    return AuthRegisterResponse(
        access_token=access_token,
        expires_in=settings.access_token_exp_minutes * 60,
        user=_build_user_response(user),
    )


@router.post("/login", response_model=AuthLoginResponse)
async def login_user(
    payload: AuthLogin,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> Any:
    result = await session.execute(
        select(User).where(
            or_(User.email == payload.identifier, User.phone == payload.identifier)
        )
    )
    user = result.scalars().first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    _set_refresh_cookie(response, refresh_token)

    return AuthLoginResponse(
        access_token=access_token,
        expires_in=settings.access_token_exp_minutes * 60,
        user=_build_user_response(user),
    )


@router.post("/refresh", response_model=AuthRefreshResponse)
async def refresh_token(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> Any:
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from None

    user = await session.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token(str(user.id))
    refresh_token_value = create_refresh_token(str(user.id))
    _set_refresh_cookie(response, refresh_token_value)

    return AuthRefreshResponse(
        access_token=access_token,
        expires_in=settings.access_token_exp_minutes * 60,
        user=_build_user_response(user),
    )


@router.post("/logout", response_model=AuthLogoutResponse)
async def logout_user(response: Response) -> Any:
    response.delete_cookie("refresh_token", path="/api/auth")
    return AuthLogoutResponse(message="Logged out")


@router.get("/me", response_model=AuthMeResponse)
async def read_current_user(current_user: User = Depends(get_current_user)) -> Any:
    return _build_user_response(current_user)
