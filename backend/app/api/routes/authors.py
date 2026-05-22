from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_roles
from app.db.session import get_session
from app.models.author import Author
from app.models.user import User
from app.schemas.author import AuthorCreate, AuthorRead, AuthorUpdate

router = APIRouter(prefix="/authors", tags=["authors"])


@router.get("", response_model=list[AuthorRead])
async def list_authors(
    session: AsyncSession = Depends(get_session),
) -> list[AuthorRead]:
    result = await session.execute(select(Author).order_by(Author.id))
    return list(result.scalars().all())


@router.get("/{author_id}", response_model=AuthorRead)
async def get_author(
    author_id: int, session: AsyncSession = Depends(get_session)
) -> AuthorRead:
    author = await session.get(Author, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author


@router.post("", response_model=AuthorRead, status_code=status.HTTP_201_CREATED)
async def create_author(
    payload: AuthorCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> AuthorRead:
    author = Author(**payload.model_dump())
    session.add(author)
    await session.commit()
    await session.refresh(author)
    return author


@router.patch("/{author_id}", response_model=AuthorRead)
async def update_author(
    author_id: int,
    payload: AuthorUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> AuthorRead:
    author = await session.get(Author, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(author, key, value)
    await session.commit()
    await session.refresh(author)
    return author


@router.delete("/{author_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_author(
    author_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> None:
    author = await session.get(Author, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    await session.delete(author)
    await session.commit()
    return None
