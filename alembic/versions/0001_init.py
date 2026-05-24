"""Initial migration: create items, tags, categories, job_queue tables.

Revision ID: 0001
Revises:
Create Date: 2026-05-23 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[Sequence[str], None] = None
depends_on: Union[Sequence[str], None] = None


def upgrade() -> None:
    # Extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS pgvector")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # items
    op.create_table(
        "items",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("raw_text", sa.Text(), nullable=True),
        sa.Column("blob_path", sa.String(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(), server_default=sa.text("'{}'"), nullable=False),
        sa.Column("enrichment", postgresql.JSONB(), server_default=sa.text("'{}'"), nullable=False),
        sa.Column("search_vector", postgresql.TSVECTOR(), nullable=True),
        sa.Column("embedding", sa.Text(), nullable=True),  # Placeholder; real vector via raw SQL below
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_items_captured_at", "items", ["captured_at"])
    op.create_index("idx_items_type", "items", ["type"])
    op.create_index("idx_items_search_vector", "items", ["search_vector"], postgresql_using="gin")
    # pgvector column and index added via raw SQL
    op.execute("ALTER TABLE items ADD COLUMN IF NOT EXISTS embedding vector(384)")
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_items_embedding ON items USING ivfflat (embedding vector_cosine_ops)"
    )

    # FTS trigger
    op.execute(
        """
        CREATE OR REPLACE FUNCTION update_search_vector()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.search_vector :=
                setweight(to_tsvector('english', COALESCE(NEW.raw_text, '')), 'A') ||
                setweight(to_tsvector('english', COALESCE(NEW.metadata->>'title', '')), 'B') ||
                setweight(to_tsvector('english', COALESCE(NEW.metadata->>'description', '')), 'C') ||
                setweight(to_tsvector('english', COALESCE(NEW.enrichment->>'summary', '')), 'C');
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
    )
    op.execute(
        """
        CREATE TRIGGER items_search_vector_update
            BEFORE INSERT OR UPDATE ON items
            FOR EACH ROW EXECUTE FUNCTION update_search_vector();
        """
    )

    # tags
    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("auto_generated", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("idx_tags_name", "tags", ["name"])

    # item_tags
    op.create_table(
        "item_tags",
        sa.Column("item_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tag_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["item_id"], ["items.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("item_id", "tag_id"),
    )

    # categories
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("idx_categories_name", "categories", ["name"])

    # item_categories
    op.create_table(
        "item_categories",
        sa.Column("item_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["item_id"], ["items.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("item_id", "category_id"),
    )

    # job_queue
    op.create_table(
        "job_queue",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("item_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("job_type", sa.String(), nullable=False),
        sa.Column("status", sa.String(), server_default=sa.text("'pending'"), nullable=False),
        sa.Column("attempts", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("max_attempts", sa.Integer(), server_default=sa.text("3"), nullable=False),
        sa.Column("run_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_job_queue_pending", "job_queue", ["status", "run_at"])
    op.create_index("idx_job_queue_item_id", "job_queue", ["item_id"])


def downgrade() -> None:
    op.drop_index("idx_job_queue_item_id", table_name="job_queue")
    op.drop_index("idx_job_queue_pending", table_name="job_queue")
    op.drop_table("job_queue")
    op.drop_table("item_categories")
    op.drop_index("idx_categories_name", table_name="categories")
    op.drop_table("categories")
    op.drop_table("item_tags")
    op.drop_index("idx_tags_name", table_name="tags")
    op.drop_table("tags")
    op.execute("DROP TRIGGER IF EXISTS items_search_vector_update ON items")
    op.execute("DROP FUNCTION IF EXISTS update_search_vector()")
    op.drop_index("idx_items_embedding", table_name="items")
    op.drop_index("idx_items_search_vector", table_name="items")
    op.drop_index("idx_items_type", table_name="items")
    op.drop_index("idx_items_captured_at", table_name="items")
    op.drop_table("items")
    op.execute("DROP EXTENSION IF EXISTS pg_trgm")
    op.execute("DROP EXTENSION IF EXISTS pgvector")
