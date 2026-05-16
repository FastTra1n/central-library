from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.hall import Hall
from app.schemas.hall import HallCreate, HallRead, HallUpdate

router = APIRouter(prefix="/halls", tags=["halls"])


@router.get("", response_model=list[HallRead])
async def list_halls(session: AsyncSession = Depends(get_session)) -> list[HallRead]:
    result = await session.execute(select(Hall).order_by(Hall.id))
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
    payload: HallCreate, session: AsyncSession = Depends(get_session)
) -> HallRead:
    hall = Hall(**payload.model_dump())
    session.add(hall)
    await session.commit()
    await session.refresh(hall)
    return hall


@router.patch("/{hall_id}", response_model=HallRead)
async def update_hall(
    hall_id: int, payload: HallUpdate, session: AsyncSession = Depends(get_session)
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
    hall_id: int, session: AsyncSession = Depends(get_session)
) -> None:
    hall = await session.get(Hall, hall_id)
    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found")
    await session.delete(hall)
    await session.commit()
    return None
