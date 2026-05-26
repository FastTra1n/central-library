from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    Response,
    UploadFile,
    status,
)
from sqlalchemy import exists, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, require_roles
from app.db.session import get_session
from app.models.author import Author
from app.models.book import Book
from app.models.book_copy import BookCopy, BookCopyStatus
from app.models.book_rating import BookRating
from app.models.user import User
from app.schemas.book import BookCreate, BookRead, BookUpdate
from app.schemas.book_copy import BookCopyCreate, BookCopyRead
from app.schemas.book_rating import BookRatingCreate

router = APIRouter(prefix="/books", tags=["books"])

COVERS_DIR = Path(__file__).resolve().parents[2] / "static" / "covers"


@router.get("", response_model=list[BookRead])
async def list_books(
    response: Response,
    search: str | None = None,
    genre_id: int | None = None,
    author_id: int | None = None,
    rating_min: int | None = None,
    available: bool | None = None,
    page: int = Query(1, ge=1),
    limit: int | None = Query(None, ge=1, le=200),
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

    total = await session.scalar(
        select(func.count()).select_from(query.order_by(None).subquery())
    )

    if limit:
        query = query.offset((page - 1) * limit).limit(limit)

    result = await session.execute(query.order_by(Book.id))
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(page)
    if limit:
        response.headers["X-Limit"] = str(limit)
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


@router.post("/{book_id}/cover", response_model=BookRead)
async def upload_book_cover(
    book_id: int,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> BookRead:
    book = await session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type")

    suffix = Path(file.filename or "").suffix or ".jpg"
    filename = f"{uuid4().hex}{suffix}"
    COVERS_DIR.mkdir(parents=True, exist_ok=True)
    file_path = COVERS_DIR / filename

    content = await file.read()
    file_path.write_bytes(content)

    book.cover_url = f"/static/covers/{filename}"
    await session.commit()
    await session.refresh(book)
    return await get_book(book.id, session)


@router.post("/{book_id}/ratings", response_model=BookRead, status_code=201)
async def rate_book(
    book_id: int,
    payload: BookRatingCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> BookRead:
    book = await session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    existing = await session.execute(
        select(BookRating).where(
            BookRating.book_id == book_id,
            BookRating.user_id == current_user.id,
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Rating already exists")

    rating = BookRating(
        book_id=book_id,
        user_id=current_user.id,
        value=payload.value,
    )
    session.add(rating)
    await session.commit()

    avg = await session.scalar(
        select(func.avg(BookRating.value)).where(BookRating.book_id == book_id)
    )
    book.rating = float(avg or 0)
    await session.commit()

    return await get_book(book.id, session)
