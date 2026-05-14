from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Hall(Base):
    __tablename__ = "halls"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    specialization: Mapped[str | None] = mapped_column(String)
    seats: Mapped[int | None] = mapped_column(Integer)

    users = relationship("User", back_populates="hall")
