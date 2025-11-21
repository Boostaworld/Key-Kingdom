from dataclasses import dataclass
import os
from pathlib import Path
from typing import Set


@dataclass
class BotConfig:
    token: str
    database_url: str
    guild_id: int | None
    allowed_user_ids: Set[int]
    allowed_role_ids: Set[int]
    log_file: str

    @classmethod
    def from_env(cls) -> "BotConfig":
        token = os.getenv("DISCORD_BOT_TOKEN")
        if not token:
            raise RuntimeError("DISCORD_BOT_TOKEN is required for the Discord bot to start.")

        database_url_raw = os.getenv("DATABASE_URL")
        database_url = cls._normalize_database_url(database_url_raw) if database_url_raw else None
        if not database_url:
            raise RuntimeError("DATABASE_URL must be set so the bot can share the admin dashboard database.")

        guild_id_raw = os.getenv("DISCORD_GUILD_ID")
        guild_id = int(guild_id_raw) if guild_id_raw else None

        allowed_user_ids = cls._parse_int_set(os.getenv("DISCORD_ALLOWED_USERS", ""))
        allowed_role_ids = cls._parse_int_set(os.getenv("DISCORD_ALLOWED_ROLES", ""))

        log_file = os.getenv("DISCORD_AUDIT_LOG", "discord_bot/audit.log")

        return cls(
            token=token,
            database_url=database_url,
            guild_id=guild_id,
            allowed_user_ids=allowed_user_ids,
            allowed_role_ids=allowed_role_ids,
            log_file=log_file,
        )

    @staticmethod
    def _parse_int_set(value: str) -> Set[int]:
        items = [item.strip() for item in value.split(",") if item.strip()]
        return {int(item) for item in items if item.isdigit()}

    @staticmethod
    def _normalize_database_url(value: str | None) -> str | None:
        """Normalize Prisma-style SQLite URLs for SQLAlchemy async engines."""
        if value is None:
            return None

        if value.startswith("file:"):
            sqlite_path = value.removeprefix("file:")
            resolved = Path(sqlite_path).expanduser().resolve()
            return f"sqlite+aiosqlite:///{resolved.as_posix()}"

        return value
