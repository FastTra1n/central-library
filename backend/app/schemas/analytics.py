from datetime import datetime

from pydantic import BaseModel


class IssuedBookItem(BaseModel):
    transaction_id: int
    issue_date: datetime
    due_date: datetime
    return_date: datetime | None = None
    copy_id: int
    copy_cipher: str
    book_id: int
    book_title: str
    authors: list[str] = []


class HallFreeSeats(BaseModel):
    hall_id: int
    name: str
    seats: int | None = None
    occupied: int
    free: int | None = None


class BookAvailability(BaseModel):
    book_id: int
    total_copies: int
    available_copies: int
    available: bool


class HallAuthorBooks(BaseModel):
    hall_id: int
    author_id: int
    issued_copies: int
    distinct_books: int


class SingleCopyBorrower(BaseModel):
    user_id: int
    full_name: str
    book_id: int
    book_title: str
    copy_id: int
    copy_cipher: str
    issue_date: datetime
    due_date: datetime


class TopRatedBook(BaseModel):
    book_id: int
    title: str
    rating: float
