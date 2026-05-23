from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_roles
from app.db.session import get_session
from app.models.hall import Hall
from app.models.user import User
from app.schemas.hall import HallCreate, HallRead, HallUpdate

router = APIRouter(prefix="/halls", tags=["halls"])


@router.get("", response_model=list[HallRead])
async def list_halls(
    response: Response,
    page: int = Query(1, ge=1),
    limit: int | None = Query(None, ge=1, le=200),
    session: AsyncSession = Depends(get_session),
) -> list[HallRead]:
    query = select(Hall)

    total = await session.scalar(
        select(func.count()).select_from(query.order_by(None).subquery())
    )

    if limit:
        query = query.offset((page - 1) * limit).limit(limit)

    result = await session.execute(query.order_by(Hall.id))
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(page)
    if limit:
        response.headers["X-Limit"] = str(limit)
    return list(result.scalars().all())


@router.get("/{hall_id}", response_model=HallRead)
async def get_hall(
    hall_id: int, session: AsyncSession = Depends(get_session)
) -> HallRead:
    hall = await session.get(Hall, hall_id)
    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found")
    return hall


@router.post("", response_model=HallRead, status_code=status.HTTP_201_CREATED)
async def create_hall(
    payload: HallCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> HallRead:
    hall = Hall(**payload.model_dump())
    session.add(hall)
    await session.commit()
    await session.refresh(hall)
    return hall


@router.patch("/{hall_id}", response_model=HallRead)
async def update_hall(
    hall_id: int,
    payload: HallUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> HallRead:
    hall = await session.get(Hall, hall_id)
    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(hall, key, value)
    await session.commit()
    await session.refresh(hall)
    return hall


@router.delete("/{hall_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hall(
    hall_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> None:
    hall = await session.get(Hall, hall_id)
    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found")
    await session.delete(hall)
    await session.commit()
    return None
