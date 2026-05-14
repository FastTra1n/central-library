from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    genre_id: Mapped[int | None] = mapped_column(ForeignKey("genres.id"))
    year: Mapped[int | None] = mapped_column(Integer)
    rating: Mapped[int] = mapped_column(Integer, default=0)

    genre = relationship("Genre", back_populates="books")
    copies = relationship(
        "BookCopy", back_populates="book", cascade="all, delete-orphan"
    )
    authors = relationship("Author", secondary="book_authors", back_populates="books")
