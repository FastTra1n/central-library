from pydantic import BaseModel, ConfigDict


class AuthorBase(BaseModel):
    full_name: str
    country: str | None = None


class AuthorCreate(AuthorBase):
    pass


class AuthorUpdate(BaseModel):
    full_name: str | None = None
    country: str | None = None


class AuthorRead(AuthorBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
