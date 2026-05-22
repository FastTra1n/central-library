from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import exists, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import require_roles
from app.db.session import get_session
from app.models.author import Author
from app.models.book import Book
from app.models.book_copy import BookCopy, BookCopyStatus
from app.models.user import User
from app.schemas.book import BookCreate, BookRead, BookUpdate
from app.schemas.book_copy import BookCopyCreate, BookCopyRead

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=list[BookRead])
async def list_books(
    search: str | None = None,
    genre_id: int | None = None,
    author_id: int | None = None,
    rating_min: int | None = None,
    available: bool | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[BookRead]:
    query = select(Book).options(
        selectinload(Book.genre),
        selectinload(Book.authors),
        selectinload(Book.copies),
    )

    if search:
        query = query.where(
            or_(
                Book.title.ilike(f"%{search}%"),
                Book.authors.any(Author.full_name.ilike(f"%{search}%")),
            )
        )

    if genre_id:
        query = query.where(Book.genre_id == genre_id)

    if author_id:
        query = query.join(Book.authors).where(Author.id == author_id).distinct()

    if rating_min is not None:
        query = query.where(Book.rating >= rating_min)

    if available is not None:
        available_exists = exists(
            select(BookCopy.id).where(
                BookCopy.book_id == Book.id,
                BookCopy.status == BookCopyStatus.Available,
            )
        )
        query = query.where(available_exists if available else ~available_exists)

    result = await session.execute(query.order_by(Book.id))
    return list(result.scalars().unique().all())


@router.get("/{book_id}", response_model=BookRead)
async def get_book(
    book_id: int, session: AsyncSession = Depends(get_session)
) -> BookRead:
    result = await session.execute(
        select(Book)
        .where(Book.id == book_id)
        .options(
            selectinload(Book.genre),
            selectinload(Book.authors),
            selectinload(Book.copies),
        )
    )
    book = result.scalars().first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("", response_model=BookRead, status_code=status.HTTP_201_CREATED)
async def create_book(
    payload: BookCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> BookRead:
    data = payload.model_dump(exclude={"author_ids", "copy_ciphers"})
    book = Book(**data)

    if payload.author_ids:
        result = await session.execute(
            select(Author).where(Author.id.in_(payload.author_ids))
        )
        authors = list(result.scalars().all())
        if len(authors) != len(set(payload.author_ids)):
            raise HTTPException(status_code=400, detail="Invalid author_ids")
        book.authors = authors

    if payload.copy_ciphers:
        book.copies = [BookCopy(cipher=cipher) for cipher in payload.copy_ciphers]

    session.add(book)
    await session.commit()
    await session.refresh(book)
    return await get_book(book.id, session)


@router.patch("/{book_id}", response_model=BookRead)
async def update_book(
    book_id: int,
    payload: BookUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> BookRead:
    result = await session.execute(
        select(Book).where(Book.id == book_id).options(selectinload(Book.authors))
    )
    book = result.scalars().first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    data = payload.model_dump(exclude_unset=True)
    author_ids = data.pop("author_ids", None)
    for key, value in data.items():
        setattr(book, key, value)

    if author_ids is not None:
        result = await session.execute(select(Author).where(Author.id.in_(author_ids)))
        authors = list(result.scalars().all())
        if len(authors) != len(set(author_ids)):
            raise HTTPException(status_code=400, detail="Invalid author_ids")
        book.authors = authors

    await session.commit()
    await session.refresh(book)
    return await get_book(book.id, session)


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> None:
    book = await session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    await session.delete(book)
    await session.commit()
    return None


@router.get("/{book_id}/copies", response_model=list[BookCopyRead])
async def list_book_copies(
    book_id: int, session: AsyncSession = Depends(get_session)
) -> list[BookCopyRead]:
    result = await session.execute(
        select(BookCopy).where(BookCopy.book_id == book_id).order_by(BookCopy.id)
    )
    return list(result.scalars().all())


@router.post(
    "/{book_id}/copies",
    response_model=BookCopyRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_book_copy(
    book_id: int,
    payload: BookCopyCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> BookCopyRead:
    book = await session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    copy = BookCopy(book_id=book_id, **payload.model_dump())
    session.add(copy)
    await session.commit()
    await session.refresh(copy)
    return copy
