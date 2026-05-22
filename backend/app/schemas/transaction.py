from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.book_copy import BookCopyRead
from app.schemas.user import UserRead


class TransactionIssue(BaseModel):
    user_id: int
    librarian_id: int
    copy_id: int | None = None
    book_id: int | None = None
    due_date: datetime | None = None


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    copy_id: int
    librarian_id: int
    issue_date: datetime
    due_date: datetime
    return_date: datetime | None = None
    user: UserRead | None = None
    librarian: UserRead | None = None
    copy: BookCopyRead | None = None
