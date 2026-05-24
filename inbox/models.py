"""SQLModel models for the Inbox database schema."""

import re
import uuid
from datetime import UTC, datetime
from typing import Literal

from pydantic import ConfigDict
from sqlalchemy import JSON, Column, DateTime
from sqlmodel import Field, Relationship, SQLModel

# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------

ItemType = Literal["text", "url", "image", "file"]

URL_RE = re.compile(r"^https?://")


# ---------------------------------------------------------------------------
# Junction tables
# ---------------------------------------------------------------------------


class ItemTag(SQLModel, table=True):
    """Many-to-many link between items and tags."""

    __tablename__ = "item_tags"

    item_id: uuid.UUID = Field(foreign_key="items.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)


class ItemCategory(SQLModel, table=True):
    """Many-to-many link between items and categories."""

    __tablename__ = "item_categories"

    item_id: uuid.UUID = Field(foreign_key="items.id", primary_key=True)
    category_id: int = Field(foreign_key="categories.id", primary_key=True)


# ---------------------------------------------------------------------------
# Main entities
# ---------------------------------------------------------------------------


class Tag(SQLModel, table=True):
    """A user-defined or auto-generated tag."""

    __tablename__ = "tags"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    auto_generated: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True)),
    )

    items: list["Item"] = Relationship(back_populates="tags", link_model=ItemTag)


class Category(SQLModel, table=True):
    """A broad category bucket."""

    __tablename__ = "categories"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: str | None = Field(default=None)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True)),
    )

    items: list["Item"] = Relationship(back_populates="categories", link_model=ItemCategory)


class Item(SQLModel, table=True):
    """A captured inbox item."""

    __tablename__ = "items"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    type: str = Field(index=True)  # text | url | image | file
    captured_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True)),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True)),
    )

    # Raw data (immutable)
    raw_text: str | None = Field(default=None)
    blob_path: str | None = Field(default=None)

    # Capture metadata
    capture_meta: dict = Field(default_factory=dict, sa_column=Column("metadata", JSON))

    # Background enrichment
    enrichment: dict = Field(default_factory=dict, sa_column=Column("enrichment", JSON))

    # Soft delete
    deleted_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True)),
    )

    # Relationships
    tags: list[Tag] = Relationship(back_populates="items", link_model=ItemTag)
    categories: list[Category] = Relationship(back_populates="items", link_model=ItemCategory)

    model_config = ConfigDict(arbitrary_types_allowed=True)

    # ------------------------------------------------------------------
    # Custom init for type detection + validation
    # ------------------------------------------------------------------

    def __init__(self, **data):
        if data.get("type") is None:
            raw_text = data.get("raw_text")
            if raw_text and URL_RE.match(raw_text):
                data["type"] = "url"
            else:
                data["type"] = "text"
        super().__init__(**data)


class JobQueue(SQLModel, table=True):
    """Background job queue."""

    __tablename__ = "job_queue"

    id: int | None = Field(default=None, primary_key=True)
    item_id: uuid.UUID = Field(foreign_key="items.id", index=True)
    job_type: str = Field(index=True)
    status: str = Field(default="pending", index=True)  # pending | running | done | failed
    attempts: int = Field(default=0)
    max_attempts: int = Field(default=3)
    run_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True)),
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_column=Column(DateTime(timezone=True)),
    )
    completed_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True)),
    )
    error_message: str | None = Field(default=None)


# ---------------------------------------------------------------------------
# Table-level indexes (declared separately for clarity)
# ---------------------------------------------------------------------------

# Note: SQLModel does not yet support native index declarations via Field().
# Alembic migrations handle all indexes and special column types (TSVECTOR, vector).
