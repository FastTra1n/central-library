from pydantic import BaseModel, ConfigDict, Field

from app.schemas.author import AuthorRead
from app.schemas.book_copy import BookCopyRead
from app.schemas.genre import GenreRead


class BookBase(BaseModel):
    title: str
    genre_id: int | None = None
    year: int | None = None
    rating: float = 0.0
    cover_url: str | None = None


class BookCreate(BookBase):
    author_ids: list[int] | None = None
    copy_ciphers: list[str] | None = None


class BookUpdate(BaseModel):
    title: str | None = None
    genre_id: int | None = None
    year: int | None = None
    rating: float | None = None
    cover_url: str | None = None
    author_ids: list[int] | None = None


class BookRead(BookBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    genre: GenreRead | None = None
    authors: list[AuthorRead] = Field(default_factory=list)
    copies: list[BookCopyRead] = Field(default_factory=list)
