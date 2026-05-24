"""Custom exceptions and FastAPI exception handlers."""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class InboxError(Exception):
    """Base exception for Inbox domain errors."""

    def __init__(self, message: str, code: str = "error"):
        self.message = message
        self.code = code
        super().__init__(message)


class NotFoundError(InboxError):
    """Requested resource does not exist."""

    def __init__(self, message: str = "Not found"):
        super().__init__(message, code="not_found")


class ValidationError(InboxError):
    """Request data failed validation."""

    def __init__(self, message: str = "Validation error"):
        super().__init__(message, code="validation_error")


class ConflictError(InboxError):
    """Resource already exists."""

    def __init__(self, message: str = "Conflict"):
        super().__init__(message, code="conflict")


# ---------------------------------------------------------------------------
# Registration helper
# ---------------------------------------------------------------------------


def register_exception_handlers(app: FastAPI) -> None:
    """Register custom exception handlers on a FastAPI app."""

    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
        return JSONResponse(
            status_code=404,
            content={"detail": exc.message, "code": exc.code},
        )

    @app.exception_handler(ValidationError)
    async def validation_error_handler(request: Request, exc: ValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={"detail": exc.message, "code": exc.code},
        )

    @app.exception_handler(ConflictError)
    async def conflict_error_handler(request: Request, exc: ConflictError) -> JSONResponse:
        return JSONResponse(
            status_code=409,
            content={"detail": exc.message, "code": exc.code},
        )
