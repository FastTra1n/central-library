from app.api.routes.analytics import router as analytics_router
from app.api.routes.authors import router as authors_router
from app.api.routes.book_copies import router as book_copies_router
from app.api.routes.books import router as books_router
from app.api.routes.genres import router as genres_router
from app.api.routes.halls import router as halls_router
from app.api.routes.roles import router as roles_router
from app.api.routes.transactions import router as transactions_router
from app.api.routes.users import router as users_router

__all__ = [
    "authors_router",
    "book_copies_router",
    "books_router",
    "genres_router",
    "halls_router",
    "roles_router",
    "users_router",
    "transactions_router",
    "analytics_router",
]
