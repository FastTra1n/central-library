from datetime import date, datetime

from app.schemas.hall import HallRead
from app.schemas.role import RoleRead
from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role_id: int
    card_number: str
    birth_date: date | None = None
    phone: str | None = None
    education: str | None = None
    hall_id: int | None = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    role_id: int | None = None
    card_number: str | None = None
    birth_date: date | None = None
    phone: str | None = None
    education: str | None = None
    hall_id: int | None = None
    password: str | None = None


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    role: RoleRead | None = None
    hall: HallRead | None = None
