"""Uvicorn entrypoint for the Inbox server."""

import uvicorn

from inbox.config import settings


def main() -> None:
    """Run the FastAPI application with uvicorn."""
    uvicorn.run(
        "inbox.server.app:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level=settings.log_level.lower(),
    )


if __name__ == "__main__":
    main()
