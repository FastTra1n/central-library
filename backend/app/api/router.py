from fastapi import APIRouter

from app.api.routes import (
    auth,
    authors,
    book_copies,
    books,
    genres,
    halls,
    roles,
    transactions,
    users,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(authors.router)
api_router.include_router(genres.router)
api_router.include_router(halls.router)
api_router.include_router(books.router)
api_router.include_router(book_copies.router)
api_router.include_router(users.router)
api_router.include_router(roles.router)
api_router.include_router(transactions.router)


@api_router.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}
