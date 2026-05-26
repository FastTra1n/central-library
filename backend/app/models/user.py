from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    card_number: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    birth_date: Mapped[date | None] = mapped_column(Date)
    phone: Mapped[str | None] = mapped_column(String)
    education: Mapped[str | None] = mapped_column(String)
    hall_id: Mapped[int | None] = mapped_column(ForeignKey("halls.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    role = relationship("Role", back_populates="users")
    hall = relationship("Hall", back_populates="users")
    transactions = relationship(
        "Transaction",
        back_populates="user",
        foreign_keys="Transaction.user_id",
    )
    issued_transactions = relationship(
        "Transaction",
        back_populates="librarian",
        foreign_keys="Transaction.librarian_id",
    )
    book_ratings = relationship(
        "BookRating", back_populates="user", cascade="all, delete-orphan"
    )
