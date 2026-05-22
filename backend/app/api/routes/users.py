from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import require_roles
from app.core.security import get_password_hash
from app.db.session import get_session
from app.models.role import Role
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserRoleUpdate, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
async def list_users(
    search: str | None = None,
    role_id: int | None = None,
    hall_id: int | None = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
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
    user_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
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
    payload: UserCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> UserRead:
    role = await session.get(Role, payload.role_id)
    if not role:
        raise HTTPException(status_code=400, detail="Role not found")

    current_role = current_user.role.name if current_user.role else None
    if current_role != "Admin" and role.name != "Reader":
        raise HTTPException(status_code=403, detail="Only admins can assign roles")

    data = payload.model_dump(exclude={"password"})
    user = User(**data, password=get_password_hash(payload.password))
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return await get_user(user.id, session, current_user)


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> UserRead:
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = payload.model_dump(exclude_unset=True)
    if "role_id" in data:
        current_role = current_user.role.name if current_user.role else None
        if current_role != "Admin":
            raise HTTPException(status_code=403, detail="Only admins can change roles")
        role = await session.get(Role, data["role_id"])
        if not role:
            raise HTTPException(status_code=400, detail="Role not found")

    if "password" in data and data["password"]:
        data["password"] = get_password_hash(data["password"])
    for key, value in data.items():
        setattr(user, key, value)

    await session.commit()
    await session.refresh(user)
    return await get_user(user.id, session, current_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> None:
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await session.delete(user)
    await session.commit()
    return None


@router.patch("/{user_id}/role", response_model=UserRead)
async def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Admin")),
) -> UserRead:
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = await session.get(Role, payload.role_id)
    if not role:
        raise HTTPException(status_code=400, detail="Role not found")

    user.role_id = role.id
    await session.commit()
    await session.refresh(user)
    return await get_user(user.id, session, current_user)
