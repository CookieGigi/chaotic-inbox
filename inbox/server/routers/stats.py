"""Stats router — inbox usage statistics."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from inbox.database import get_session
from inbox.models import Category, Item, Tag
from inbox.server.schemas import StatsResponse

router = APIRouter()
SessionDep = Annotated[AsyncSession, Depends(get_session)]


@router.get("")
async def get_stats(session: SessionDep) -> StatsResponse:
    """Return inbox usage statistics."""
    total_items_result = await session.execute(
        select(func.count()).select_from(Item).where(Item.deleted_at.is_(None))
    )
    total_items = total_items_result.scalar_one()

    by_type_result = await session.execute(
        select(Item.type, func.count()).where(Item.deleted_at.is_(None)).group_by(Item.type)
    )
    by_type = {row[0]: row[1] for row in by_type_result.all()}

    total_tags_result = await session.execute(select(func.count()).select_from(Tag))
    total_tags = total_tags_result.scalar_one()

    total_categories_result = await session.execute(select(func.count()).select_from(Category))
    total_categories = total_categories_result.scalar_one()

    return StatsResponse(
        total_items=total_items,
        by_type=by_type,
        total_tags=total_tags,
        total_categories=total_categories,
        storage_usage_bytes=0,
    )
