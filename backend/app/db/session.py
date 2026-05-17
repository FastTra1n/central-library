from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.db.base import Base

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)


async def init_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    from app.models.role import Role

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Role))
        if result.scalars().first() is None:
            session.add_all(
                [
                    Role(name="Reader"),
                    Role(name="Librarian"),
                    Role(name="Admin"),
                ]
            )
            await session.commit()


async def get_session():
    async with AsyncSessionLocal() as session:
        yield session
