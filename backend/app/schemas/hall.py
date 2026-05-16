from pydantic import BaseModel, ConfigDict


class HallBase(BaseModel):
    name: str
    specialization: str | None = None
    seats: int | None = None


class HallCreate(HallBase):
    pass


class HallUpdate(BaseModel):
    name: str | None = None
    specialization: str | None = None
    seats: int | None = None


class HallRead(HallBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
