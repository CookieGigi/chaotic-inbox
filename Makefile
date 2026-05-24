.PHONY: dev build test lint fmt migrate clean run-server run-cli web-dev setup-db

# ---------------------------------------------------------------------------
# Development (choose one based on your setup)
# ---------------------------------------------------------------------------

# Option 1: You already have PostgreSQL running (e.g. NixOS service)
#    Set DATABASE_URL in .env and just run: make run-server
#
# Option 2: Use Podman (rootless, no daemon) — included in the dev shell
#    make dev-podman
#
# Option 3: Manual local PostgreSQL (see docs for NixOS setup)
#    make setup-db  # one-time init
#    make run-server

# Default dev target — shows help if nothing is configured
dev:
	@echo "Choose a dev target based on your PostgreSQL setup:"
	@echo ""
	@echo "  make dev-podman     # Start PostgreSQL via Podman (rootless)"
	@echo "  make run-server     # If PostgreSQL is already running"
	@echo "  make setup-db       # One-time local PostgreSQL init"
	@echo ""
	@echo "Then in another terminal: make web-dev"

# Podman-based development (rootless, no daemon needed)
dev-podman:
	@echo "Starting PostgreSQL via Podman..."
	podman-compose up -d postgres
	@echo "Waiting for postgres to be healthy..."
	@sleep 3
	$(MAKE) migrate
	@echo "Run 'make run-server' and 'make web-dev' in separate terminals"

# One-time local PostgreSQL database setup
# Assumes psql can connect to a running PostgreSQL server
setup-db:
	@echo "Creating inbox database and user..."
	psql postgres -c "CREATE USER inbox WITH PASSWORD 'inbox' SUPERUSER;" 2>/dev/null || true
	psql postgres -c "CREATE DATABASE inbox OWNER inbox;" 2>/dev/null || true
	psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE inbox TO inbox;" 2>/dev/null || true
	psql inbox -c "CREATE EXTENSION IF NOT EXISTS pgvector;" 2>/dev/null || true
	psql inbox -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;" 2>/dev/null || true
	$(MAKE) migrate
	@echo "Database ready. Run 'make run-server' to start the API."

# ---------------------------------------------------------------------------
# Running services
# ---------------------------------------------------------------------------

# Run the FastAPI server with hot reload
# Hot reload works the same with or without Docker — it's uvicorn watching
# your Python files and restarting automatically on change.
run-server:
	uv run uvicorn inbox.server.main:app --reload --port 8080 --host 0.0.0.0

# Run the React web dev server (in another terminal)
web-dev:
	cd web && pnpm dev

# Run the CLI
run-cli:
	uv run inbox

# ---------------------------------------------------------------------------
# Build & Test
# ---------------------------------------------------------------------------

build:
	cd web && pnpm build
	@echo "Python server needs no build step (run directly with uv)"

test:
	uv run pytest
	cd web && pnpm test

lint:
	uv run ruff check inbox/ tests/
	cd web && pnpm lint

fmt:
	uv run ruff format inbox/ tests/
	cd web && pnpm fmt

# Check code without running
 check:
	uv run ruff check inbox/ tests/
	cd web && pnpm run type-check

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

migrate:
	uv run alembic upgrade head

migrate-add:
	uv run alembic revision --autogenerate -m "$(msg)"

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------

clean:
	podman-compose down -v 2>/dev/null || true
	rm -rf web/node_modules web/dist .venv
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name '*.pyc' -delete 2>/dev/null || true
