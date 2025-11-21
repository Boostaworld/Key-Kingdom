from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker

from .config import BotConfig
from .models import Base


class Database:
    def __init__(self, config: BotConfig):
        self.engine: AsyncEngine = create_async_engine(config.database_url, future=True)
        self.session_factory: sessionmaker[AsyncSession] = async_sessionmaker(
            self.engine, expire_on_commit=False
        )

    async def init(self) -> None:
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    @asynccontextmanager
    async def session(self):
        async with self.session_factory() as session:
            yield session
