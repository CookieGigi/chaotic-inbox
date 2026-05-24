"""FastAPI application and router registration."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from inbox.server.exceptions import register_exception_handlers
from inbox.server.routers import (
    categories,
    health,
    items,
    search,
    stats,
    tags,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="Chaotic Inbox API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(health.router, tags=["health"])
app.include_router(items.router, prefix="/v1/items", tags=["items"])
app.include_router(search.router, prefix="/v1/search", tags=["search"])
app.include_router(tags.router, prefix="/v1/tags", tags=["tags"])
app.include_router(categories.router, prefix="/v1/categories", tags=["categories"])
app.include_router(stats.router, prefix="/v1/stats", tags=["stats"])
