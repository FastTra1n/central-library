from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.genre import Genre
from app.schemas.genre import GenreCreate, GenreRead, GenreUpdate

router = APIRouter(prefix="/genres", tags=["genres"])


@router.get("", response_model=list[GenreRead])
async def list_genres(session: AsyncSession = Depends(get_session)) -> list[GenreRead]:
    result = await session.execute(select(Genre).order_by(Genre.id))
    return list(result.scalars().all())


@router.get("/{genre_id}", response_model=GenreRead)
async def get_genre(
    genre_id: int, session: AsyncSession = Depends(get_session)
) -> GenreRead:
    genre = await session.get(Genre, genre_id)
    if not genre:
        raise HTTPException(status_code=404, detail="Genre not found")
    return genre


@router.post("", response_model=GenreRead, status_code=status.HTTP_201_CREATED)
async def create_genre(
    payload: GenreCreate, session: AsyncSession = Depends(get_session)
) -> GenreRead:
    genre = Genre(**payload.model_dump())
    session.add(genre)
    await session.commit()
    await session.refresh(genre)
    return genre


@router.patch("/{genre_id}", response_model=GenreRead)
async def update_genre(
    genre_id: int, payload: GenreUpdate, session: AsyncSession = Depends(get_session)
) -> GenreRead:
    genre = await session.get(Genre, genre_id)
    if not genre:
        raise HTTPException(status_code=404, detail="Genre not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(genre, key, value)
    await session.commit()
    await session.refresh(genre)
    return genre


@router.delete("/{genre_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_genre(
    genre_id: int, session: AsyncSession = Depends(get_session)
) -> None:
    genre = await session.get(Genre, genre_id)
    if not genre:
        raise HTTPException(status_code=404, detail="Genre not found")
    await session.delete(genre)
    await session.commit()
    return None
