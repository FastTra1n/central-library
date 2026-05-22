from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_session
from app.models.book_copy import BookCopy, BookCopyStatus
from app.models.hall import Hall
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionIssue, TransactionRead

router = APIRouter(prefix="/transactions", tags=["transactions"])


async def _get_user(session: AsyncSession, user_id: int) -> User:
    result = await session.execute(
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.role), selectinload(User.hall))
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def _ensure_librarian(session: AsyncSession, librarian_id: int) -> User:
    librarian = await _get_user(session, librarian_id)
    role_name = librarian.role.name if librarian.role else None
    if role_name not in {"Librarian", "Admin"}:
        raise HTTPException(
            status_code=403, detail="Only librarians can issue or return books"
        )
    return librarian


async def _ensure_hall_has_seat(session: AsyncSession, user: User) -> Hall:
    if not user.hall_id:
        raise HTTPException(status_code=400, detail="Reader is not assigned to a hall")

    hall = await session.get(Hall, user.hall_id)
    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found")

    if hall.seats is None:
        return hall

    if hall.seats <= 0:
        raise HTTPException(status_code=400, detail="Hall has no available seats")

    occupancy_query = select(func.count(User.id)).where(
        and_(User.hall_id == hall.id, User.id != user.id)
    )
    occupancy = (await session.execute(occupancy_query)).scalar_one()
    free_seats = hall.seats - occupancy
    if free_seats <= 0:
        raise HTTPException(status_code=400, detail="Hall has no available seats")

    return hall


async def _resolve_copy(
    session: AsyncSession, copy_id: int | None, book_id: int | None
) -> BookCopy:
    if copy_id is None and book_id is None:
        raise HTTPException(status_code=400, detail="copy_id or book_id is required")

    if copy_id is not None:
        copy = await session.get(BookCopy, copy_id)
        if not copy:
            raise HTTPException(status_code=404, detail="Book copy not found")
        if book_id is not None and copy.book_id != book_id:
            raise HTTPException(status_code=400, detail="Copy does not belong to book")
        return copy

    result = await session.execute(
        select(BookCopy)
        .where(
            BookCopy.book_id == book_id,
            BookCopy.status == BookCopyStatus.Available,
        )
        .order_by(BookCopy.id)
        .limit(1)
    )
    copy = result.scalars().first()
    if not copy:
        raise HTTPException(status_code=400, detail="No available copies")
    return copy


@router.post("/issue", response_model=TransactionRead, status_code=201)
async def issue_book(
    payload: TransactionIssue,
    session: AsyncSession = Depends(get_session),
) -> TransactionRead:
    user = await _get_user(session, payload.user_id)
    await _ensure_librarian(session, payload.librarian_id)
    await _ensure_hall_has_seat(session, user)

    copy = await _resolve_copy(session, payload.copy_id, payload.book_id)
    if copy.status != BookCopyStatus.Available:
        raise HTTPException(status_code=400, detail="Book copy is not available")

    issue_date = datetime.utcnow()
    due_date = payload.due_date or issue_date + timedelta(days=14)
    if due_date <= issue_date:
        raise HTTPException(status_code=400, detail="due_date must be in the future")

    copy.status = BookCopyStatus.Borrowed
    transaction = Transaction(
        user_id=user.id,
        copy_id=copy.id,
        librarian_id=payload.librarian_id,
        issue_date=issue_date,
        due_date=due_date,
    )
    session.add(transaction)
    await session.commit()
    await session.refresh(transaction)
    return await get_transaction(transaction.id, session)


@router.post("/{transaction_id}/return", response_model=TransactionRead)
async def return_book(
    transaction_id: int, session: AsyncSession = Depends(get_session)
) -> TransactionRead:
    result = await session.execute(
        select(Transaction)
        .where(Transaction.id == transaction_id)
        .options(
            selectinload(Transaction.copy),
            selectinload(Transaction.user).selectinload(User.role),
            selectinload(Transaction.user).selectinload(User.hall),
            selectinload(Transaction.librarian).selectinload(User.role),
            selectinload(Transaction.librarian).selectinload(User.hall),
        )
    )
    transaction = result.scalars().first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.return_date:
        raise HTTPException(status_code=400, detail="Book already returned")

    if transaction.copy.status == BookCopyStatus.Lost:
        raise HTTPException(status_code=400, detail="Book copy is marked as lost")

    transaction.return_date = datetime.utcnow()
    transaction.copy.status = BookCopyStatus.Available
    await session.commit()
    await session.refresh(transaction)
    return await get_transaction(transaction.id, session)


@router.get("", response_model=list[TransactionRead])
async def list_transactions(
    user_id: int | None = None,
    copy_id: int | None = None,
    status: str | None = None,
    from_: datetime | None = Query(None, alias="from"),
    to: datetime | None = Query(None, alias="to"),
    session: AsyncSession = Depends(get_session),
) -> list[TransactionRead]:
    query = select(Transaction).options(
        selectinload(Transaction.user).selectinload(User.role),
        selectinload(Transaction.user).selectinload(User.hall),
        selectinload(Transaction.librarian).selectinload(User.role),
        selectinload(Transaction.librarian).selectinload(User.hall),
        selectinload(Transaction.copy),
    )

    if user_id is not None:
        query = query.where(Transaction.user_id == user_id)

    if copy_id is not None:
        query = query.where(Transaction.copy_id == copy_id)

    if status == "issued":
        query = query.where(Transaction.return_date.is_(None))
    elif status == "returned":
        query = query.where(Transaction.return_date.is_not(None))
    elif status is not None:
        raise HTTPException(status_code=400, detail="Invalid status filter")

    if from_ is not None:
        query = query.where(Transaction.issue_date >= from_)

    if to is not None:
        query = query.where(Transaction.issue_date <= to)

    result = await session.execute(query.order_by(Transaction.issue_date.desc()))
    return list(result.scalars().unique().all())


@router.get("/{transaction_id}", response_model=TransactionRead)
async def get_transaction(
    transaction_id: int, session: AsyncSession = Depends(get_session)
) -> TransactionRead:
    result = await session.execute(
        select(Transaction)
        .where(Transaction.id == transaction_id)
        .options(
            selectinload(Transaction.user).selectinload(User.role),
            selectinload(Transaction.user).selectinload(User.hall),
            selectinload(Transaction.librarian).selectinload(User.role),
            selectinload(Transaction.librarian).selectinload(User.hall),
            selectinload(Transaction.copy),
        )
    )
    transaction = result.scalars().first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction
