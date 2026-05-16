from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import get_password_hash
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
async def list_users(
    search: str | None = None,
    role_id: int | None = None,
    hall_id: int | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[UserRead]:
    query = select(User).options(selectinload(User.role), selectinload(User.hall))

    if search:
        query = query.where(
            or_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )

    if role_id:
        query = query.where(User.role_id == role_id)

    if hall_id:
        query = query.where(User.hall_id == hall_id)

    result = await session.execute(query.order_by(User.id))
    return list(result.scalars().unique().all())


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int, session: AsyncSession = Depends(get_session)
) -> UserRead:
    result = await session.execute(
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.role), selectinload(User.hall))
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate, session: AsyncSession = Depends(get_session)
) -> UserRead:
    data = payload.model_dump(exclude={"password"})
    user = User(**data, password=get_password_hash(payload.password))
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return await get_user(user.id, session)


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int, payload: UserUpdate, session: AsyncSession = Depends(get_session)
) -> UserRead:
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = payload.model_dump(exclude_unset=True)
    if "password" in data and data["password"]:
        data["password"] = get_password_hash(data["password"])
    for key, value in data.items():
        setattr(user, key, value)

    await session.commit()
    await session.refresh(user)
    return await get_user(user.id, session)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int, session: AsyncSession = Depends(get_session)
) -> None:
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await session.delete(user)
    await session.commit()
    return None
