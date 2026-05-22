from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_roles
from app.db.session import get_session
from app.models.role import Role
from app.models.user import User
from app.schemas.role import RoleRead

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("", response_model=list[RoleRead])
async def list_roles(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Admin")),
) -> list[RoleRead]:
    result = await session.execute(select(Role).order_by(Role.id))
    return list(result.scalars().all())
