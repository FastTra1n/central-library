from fastapi import APIRouter

from app.api.routes import authors, books, genres

api_router = APIRouter()

api_router.include_router(authors.router)
api_router.include_router(genres.router)
api_router.include_router(books.router)


@api_router.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}
