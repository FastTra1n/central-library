import os
import tempfile
import uuid
from datetime import date

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

TEST_DB_PATH = os.path.join(
    tempfile.gettempdir(), f"central_library_test_{uuid.uuid4().hex}.db"
)

os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{TEST_DB_PATH}"
os.environ["JWT_SECRET"] = "test-secret"

from app.core.security import get_password_hash  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import AsyncSessionLocal, engine, init_db_and_tables  # noqa: E402
from app.main import app  # noqa: E402
from app.models.role import Role  # noqa: E402
from app.models.user import User  # noqa: E402


@pytest.fixture(scope="session")
def event_loop():
    import asyncio

    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def reset_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await init_db_and_tables()
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture()
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture()
async def admin_user():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Role).where(Role.name == "Admin"))
        admin_role = result.scalars().first()
        user = User(
            full_name="Admin User",
            email="admin@example.com",
            password=get_password_hash("admin-pass"),
            role_id=admin_role.id,
            card_number="ADMIN-0001",
            birth_date=date(1990, 1, 1),
            phone="+70000000001",
            education="Admin",
            hall_id=None,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


@pytest.fixture()
async def admin_token(async_client, admin_user):
    response = await async_client.post(
        "/api/auth/login",
        json={"identifier": admin_user.email, "password": "admin-pass"},
    )
    assert response.status_code == 200
    data = response.json()
    return data["access_token"]
