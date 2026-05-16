from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.db.session import init_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_and_tables()
    yield


app = FastAPI(title="Central Library API", lifespan=lifespan)
app.include_router(api_router, prefix="/api")
