from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    copy_id: Mapped[int] = mapped_column(ForeignKey("book_copies.id"), nullable=False)
    librarian_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    issue_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    return_date: Mapped[datetime | None] = mapped_column(DateTime)

    user = relationship("User", foreign_keys=[user_id], back_populates="transactions")
    librarian = relationship(
        "User", foreign_keys=[librarian_id], back_populates="issued_transactions"
    )
    copy = relationship("BookCopy", back_populates="transactions")
