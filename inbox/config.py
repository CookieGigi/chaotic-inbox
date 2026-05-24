"""Pydantic settings for Inbox configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_prefix="INBOX_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+asyncpg://inbox:inbox@localhost:5432/inbox"
    bind_address: str = "0.0.0.0:8080"
    blob_storage_path: str = "/var/lib/inbox/blobs"
    log_level: str = "INFO"
    max_body_size: int = 100 * 1024 * 1024  # 100MB

    @property
    def host(self) -> str:
        return self.bind_address.rsplit(":", 1)[0]

    @property
    def port(self) -> int:
        return int(self.bind_address.rsplit(":", 1)[1])


settings = Settings()
