from pydantic import BaseModel, Field


class BookRatingCreate(BaseModel):
    value: int = Field(ge=1, le=5)
