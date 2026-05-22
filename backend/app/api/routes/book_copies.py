from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_roles
from app.db.session import get_session
from app.models.book_copy import BookCopy
from app.models.user import User
from app.schemas.book_copy import BookCopyRead, BookCopyUpdate

router = APIRouter(prefix="/book-copies", tags=["book-copies"])


@router.patch("/{copy_id}", response_model=BookCopyRead)
async def update_copy(
    copy_id: int,
    payload: BookCopyUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> BookCopyRead:
    copy = await session.get(BookCopy, copy_id)
    if not copy:
        raise HTTPException(status_code=404, detail="Book copy not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(copy, key, value)
    await session.commit()
    await session.refresh(copy)
    return copy


@router.delete("/{copy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_copy(
    copy_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> None:
    copy = await session.get(BookCopy, copy_id)
    if not copy:
        raise HTTPException(status_code=404, detail="Book copy not found")
    await session.delete(copy)
    await session.commit()
    return None
