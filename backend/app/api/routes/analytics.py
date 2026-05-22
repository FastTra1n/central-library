from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import require_roles
from app.db.session import get_session
from app.models.author import Author
from app.models.book import Book
from app.models.book_author import BookAuthor
from app.models.book_copy import BookCopy, BookCopyStatus
from app.models.hall import Hall
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.analytics import (
    BookAvailability,
    HallAuthorBooks,
    HallFreeSeats,
    IssuedBookItem,
    SingleCopyBorrower,
    TopRatedBook,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/readers/{reader_id}/issued-books", response_model=list[IssuedBookItem])
async def issued_books_by_reader(
    reader_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> list[IssuedBookItem]:
    user = await session.get(User, reader_id)
    if not user:
        raise HTTPException(status_code=404, detail="Reader not found")

    result = await session.execute(
        select(Transaction)
        .where(
            Transaction.user_id == reader_id,
            Transaction.return_date.is_(None),
        )
        .options(
            selectinload(Transaction.copy)
            .selectinload(BookCopy.book)
            .selectinload(Book.authors)
        )
        .order_by(Transaction.issue_date.desc())
    )
    transactions = result.scalars().unique().all()

    items: list[IssuedBookItem] = []
    for transaction in transactions:
        copy = transaction.copy
        book = copy.book if copy else None
        items.append(
            IssuedBookItem(
                transaction_id=transaction.id,
                issue_date=transaction.issue_date,
                due_date=transaction.due_date,
                return_date=transaction.return_date,
                copy_id=copy.id if copy else 0,
                copy_cipher=copy.cipher if copy else "",
                book_id=book.id if book else 0,
                book_title=book.title if book else "",
                authors=[author.full_name for author in (book.authors or [])]
                if book
                else [],
            )
        )

    return items


@router.get("/halls/free-seats", response_model=list[HallFreeSeats])
async def free_seats_by_hall(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> list[HallFreeSeats]:
    result = await session.execute(
        select(Hall, func.count(User.id))
        .outerjoin(User, User.hall_id == Hall.id)
        .group_by(Hall.id)
        .order_by(Hall.id)
    )

    data: list[HallFreeSeats] = []
    for hall, occupied in result.all():
        free = None
        if hall.seats is not None:
            free = max(hall.seats - occupied, 0)
        data.append(
            HallFreeSeats(
                hall_id=hall.id,
                name=hall.name,
                seats=hall.seats,
                occupied=occupied,
                free=free,
            )
        )

    return data


@router.get("/books/availability", response_model=BookAvailability)
async def book_availability(
    book_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> BookAvailability:
    book = await session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    total = (
        await session.execute(
            select(func.count(BookCopy.id)).where(BookCopy.book_id == book_id)
        )
    ).scalar_one()
    available = (
        await session.execute(
            select(func.count(BookCopy.id)).where(
                BookCopy.book_id == book_id,
                BookCopy.status == BookCopyStatus.Available,
            )
        )
    ).scalar_one()

    return BookAvailability(
        book_id=book_id,
        total_copies=total,
        available_copies=available,
        available=available > 0,
    )


@router.get("/halls/{hall_id}/author-books", response_model=HallAuthorBooks)
async def author_books_in_hall(
    hall_id: int,
    author_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> HallAuthorBooks:
    hall = await session.get(Hall, hall_id)
    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found")

    author = await session.get(Author, author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    result = await session.execute(
        select(
            func.count(Transaction.id),
            func.count(func.distinct(Book.id)),
        )
        .join(User, Transaction.user_id == User.id)
        .join(BookCopy, Transaction.copy_id == BookCopy.id)
        .join(Book, BookCopy.book_id == Book.id)
        .join(BookAuthor, BookAuthor.book_id == Book.id)
        .where(
            User.hall_id == hall_id,
            BookAuthor.author_id == author_id,
            Transaction.return_date.is_(None),
        )
    )
    issued_copies, distinct_books = result.one()

    return HallAuthorBooks(
        hall_id=hall_id,
        author_id=author_id,
        issued_copies=issued_copies,
        distinct_books=distinct_books,
    )


@router.get("/books/single-copy/borrowers", response_model=list[SingleCopyBorrower])
async def single_copy_borrowers(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> list[SingleCopyBorrower]:
    single_copy_books = (
        select(BookCopy.book_id)
        .group_by(BookCopy.book_id)
        .having(func.count(BookCopy.id) == 1)
        .subquery()
    )

    result = await session.execute(
        select(Transaction, User, Book, BookCopy)
        .join(User, Transaction.user_id == User.id)
        .join(BookCopy, Transaction.copy_id == BookCopy.id)
        .join(Book, BookCopy.book_id == Book.id)
        .where(
            Transaction.return_date.is_(None),
            BookCopy.book_id.in_(select(single_copy_books.c.book_id)),
        )
        .order_by(Transaction.issue_date.desc())
    )

    items: list[SingleCopyBorrower] = []
    for transaction, user, book, copy in result.all():
        items.append(
            SingleCopyBorrower(
                user_id=user.id,
                full_name=user.full_name,
                book_id=book.id,
                book_title=book.title,
                copy_id=copy.id,
                copy_cipher=copy.cipher,
                issue_date=transaction.issue_date,
                due_date=transaction.due_date,
            )
        )

    return items


@router.get("/books/top-rated", response_model=list[TopRatedBook])
async def top_rated_books(
    limit: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_roles("Librarian", "Admin")),
) -> list[TopRatedBook]:
    result = await session.execute(
        select(Book).order_by(Book.rating.desc(), Book.id).limit(limit)
    )
    books = result.scalars().all()

    return [
        TopRatedBook(book_id=book.id, title=book.title, rating=book.rating)
        for book in books
    ]
