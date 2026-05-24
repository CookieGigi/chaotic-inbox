# Phase 0 — Foundation

**Status:** 🔄 In Progress
**Duration:** 1-2 days
**Goal:** Set up development environment and project skeleton

---

## Deliverables

- [ ] Nix flake with Python (uv, Python 3.12+, ruff) + Node.js + PostgreSQL client + Docker Compose
- [ ] `pyproject.toml` with FastAPI, SQLModel, Alembic, asyncpg, Typer, Rich, sentence-transformers, pytest, ruff
- [ ] Python project skeleton (`inbox/` package with server, CLI, models, database, config)
- [ ] Alembic configured with initial migration (`0001_init.py`)
- [ ] FastAPI server skeleton (health endpoint, CORS middleware)
- [ ] Typer CLI skeleton (add, list, info, delete commands)
- [ ] CI/CD pipeline (GitHub Actions for Python + Web)
- [ ] `docker-compose.yml` with PostgreSQL (pgvector) + server service
- [ ] Makefile with `dev`, `test`, `lint`, `migrate`, `run-server`

---

## Tasks

### T-01: Development Environment
- Configure Nix flake with Python toolchain (uv, python3, ruff, postgresql)
- Keep Node.js + pnpm for web UI
- Add Docker Compose for PostgreSQL
- Create `make dev` command

### T-02: Python Project Structure
- Create `pyproject.toml` with dependencies and dev dependencies
- Create `inbox/` package with `__init__.py`
- Create `inbox/config.py` (Pydantic Settings)
- Create `inbox/models.py` (SQLModel entities)
- Create `inbox/database.py` (async engine + session)
- Create `inbox/server/` with `app.py`, `main.py`, routers
- Create `inbox/cli/` with `main.py`
- Create `tests/` with `test_health.py`

### T-03: Database Migrations
- Install Alembic (`uv run alembic init alembic`)
- Configure `alembic.ini` with async URL
- Configure `alembic/env.py` to use SQLModel metadata
- Write `0001_init.py` migration (items, tags, categories, job_queue, FTS trigger, pgvector)
- Test migration: `make migrate`

### T-04: Server Skeleton
- FastAPI app with lifespan events
- CORS middleware configuration
- Health check router (`GET /health`)
- Items router with CRUD stubs
- Uvicorn entrypoint (`inbox.server.main:main`)

### T-05: CLI Skeleton
- Typer app with commands: add, list, info, delete
- httpx client with configurable base URL
- Rich formatting for tables and JSON output
- `--json` flag for all commands
- `--stdin` and `--file` options for `add`

### T-06: Documentation
- Update `design/architecture/v0.md` for Python stack
- Update `design/spec/v0.md` with Python decisions
- Update `plan/progress-report-phase0.md`
- Update all phase files (00-06) for Python

### T-07: CI/CD
- GitHub Actions workflow for Python (pytest, ruff, alembic migrate)
- GitHub Actions workflow for Web (pnpm test, build, lint)
- PostgreSQL service container in CI

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12+, FastAPI, SQLModel, asyncpg |
| Frontend | React 19, Vite, Tailwind CSS v4, Zustand |
| Database | PostgreSQL 17 + pgvector + pg_trgm |
| Dev Tools | uv, ruff, pytest, alembic |
| Infra | Docker Compose, Nix flake |
| CI/CD | GitHub Actions |
