from fastapi import FastAPI

from app.api.router import api_router

app = FastAPI(title="Central Library API")
app.include_router(api_router, prefix="/api")
