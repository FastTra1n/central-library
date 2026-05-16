from app.models.book_copy import BookCopyStatus
from pydantic import BaseModel, ConfigDict


class BookCopyBase(BaseModel):
    cipher: str
    status: BookCopyStatus = BookCopyStatus.Available


class BookCopyCreate(BookCopyBase):
    pass


class BookCopyUpdate(BaseModel):
    cipher: str | None = None
    status: BookCopyStatus | None = None


class BookCopyRead(BookCopyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    book_id: int
