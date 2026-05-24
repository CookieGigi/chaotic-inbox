"""SQLModel models for the Inbox database schema."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Index, text
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlmodel import Field, Relationship, SQLModel

# ---------------------------------------------------------------------------
# Custom types
# ---------------------------------------------------------------------------

# pgvector embedding column — 384 dimensions (all-MiniLM-L6-v2)
EmbeddingColumn = Field(
    default=None,
    sa_column=Column(Vector(384)),
)

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

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    auto_generated: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": text("now()")},
    )

    items: list["Item"] = Relationship(back_populates="tags", link_model=ItemTag)


class Category(SQLModel, table=True):
    """A broad category bucket."""

    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = Field(default=None)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": text("now()")},
    )

    items: list["Item"] = Relationship(back_populates="categories", link_model=ItemCategory)


class Item(SQLModel, table=True):
    """A captured inbox item."""

    __tablename__ = "items"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    type: str = Field(index=True)  # text | url | image | file
    captured_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": text("now()")},
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": text("now()")},
    )

    # Raw data (immutable)
    raw_text: Optional[str] = Field(default=None)
    blob_path: Optional[str] = Field(default=None)

    # Capture metadata
    capture_meta: dict = Field(default_factory=dict, sa_column=Column("metadata", JSONB))

    # Background enrichment
    enrichment: dict = Field(default_factory=dict, sa_column=Column("enrichment", JSONB))

    # Search indexing
    search_vector: Optional[str] = Field(default=None, sa_column=Column(TSVECTOR))
    embedding: Optional[list[float]] = EmbeddingColumn

    # Soft delete
    deleted_at: Optional[datetime] = Field(default=None)

    # Relationships
    tags: list[Tag] = Relationship(back_populates="items", link_model=ItemTag)
    categories: list[Category] = Relationship(back_populates="items", link_model=ItemCategory)

    class Config:
        arbitrary_types_allowed = True


class JobQueue(SQLModel, table=True):
    """Background job queue."""

    __tablename__ = "job_queue"

    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: uuid.UUID = Field(foreign_key="items.id", index=True)
    job_type: str = Field(index=True)
    status: str = Field(default="pending", index=True)  # pending | running | done | failed
    attempts: int = Field(default=0)
    max_attempts: int = Field(default=3)
    run_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": text("now()")},
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": text("now()")},
    )
    completed_at: Optional[datetime] = Field(default=None)
    error_message: Optional[str] = Field(default=None)


# ---------------------------------------------------------------------------
# Table-level indexes (declared separately for clarity)
# ---------------------------------------------------------------------------

# Note: SQLModel does not yet support native index declarations on search_vector
# or embedding columns via Field(), so we rely on Alembic / raw DDL for:
#   - GIN index on items.search_vector
#   - IVFFlat index on items.embedding
