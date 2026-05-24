"""Tags router — CRUD for tags."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from inbox.database import get_session
from inbox.models import Tag
from inbox.server.exceptions import ConflictError, NotFoundError
from inbox.server.schemas import TagCreate, TagResponse

router = APIRouter()
SessionDep = Annotated[AsyncSession, Depends(get_session)]


def _tag_response(tag: Tag) -> TagResponse:
    return TagResponse(
        id=tag.id,
        name=tag.name,
        auto_generated=tag.auto_generated,
        created_at=tag.created_at,
    )


@router.get("")
async def list_tags(session: SessionDep) -> list[TagResponse]:
    """List all tags."""
    result = await session.execute(select(Tag).order_by(Tag.name))
    tags = result.scalars().all()
    return [_tag_response(t) for t in tags]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_tag(session: SessionDep, data: TagCreate) -> TagResponse:
    """Create a new tag."""
    tag = Tag(name=data.name)
    session.add(tag)
    try:
        await session.commit()
    except IntegrityError as err:
        await session.rollback()
        raise ConflictError(f"Tag '{data.name}' already exists") from err
    await session.refresh(tag)
    return _tag_response(tag)


@router.get("/{tag_id}")
async def get_tag(session: SessionDep, tag_id: int) -> TagResponse:
    """Get a tag by ID."""
    tag = await session.get(Tag, tag_id)
    if not tag:
        raise NotFoundError(f"Tag {tag_id} not found")
    return _tag_response(tag)


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(session: SessionDep, tag_id: int) -> None:
    """Delete a tag."""
    tag = await session.get(Tag, tag_id)
    if not tag:
        raise NotFoundError(f"Tag {tag_id} not found")
    await session.delete(tag)
    await session.commit()
