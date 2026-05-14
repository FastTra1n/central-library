import enum

from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BookCopyStatus(str, enum.Enum):
    Available = "Available"
    Borrowed = "Borrowed"
    Lost = "Lost"


class BookCopy(Base):
    __tablename__ = "book_copies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"), nullable=False)
    cipher: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    status: Mapped[BookCopyStatus] = mapped_column(
        Enum(BookCopyStatus), default=BookCopyStatus.Available
    )

    book = relationship("Book", back_populates="copies")
    transactions = relationship("Transaction", back_populates="copy")
