.PHONY: dev start stop build test tests test-e2e lint fmt migrate migrate-add clean run-server run-cli web-dev setup-db

# ---------------------------------------------------------------------------
# One-command development
# ---------------------------------------------------------------------------

## Start the full development stack (PostgreSQL + API server)
start:
	@echo "=== Starting PostgreSQL via Podman ==="
	podman-compose up -d postgres
	@echo "=== Waiting for PostgreSQL to be healthy ==="
	@for i in $$(seq 1 30); do \
		podman ps --filter "name=inbox-postgres" --filter "health=healthy" --format "{{.Names}}" | grep -q inbox-postgres && break; \
		echo "  ...waiting ($$i/30)"; \
		sleep 1; \
	done
	@echo "=== Running database migrations ==="
	uv run alembic upgrade head
	@echo "=== Starting FastAPI server (Ctrl+C to stop) ==="
	uv run uvicorn inbox.server.main:app --reload --port 8080 --host 0.0.0.0

## Stop all development containers
stop:
	podman-compose down

# ---------------------------------------------------------------------------
# Running services (manual / already-running DB)
# ---------------------------------------------------------------------------

# Run the FastAPI server with hot reload (assumes DB is already running)
run-server:
	uv run uvicorn inbox.server.main:app --reload --port 8080 --host 0.0.0.0

# Run the React web dev server (in another terminal)
web-dev:
	cd web && pnpm dev

# Run the CLI — pass extra args via ARGS variable
#   make run-cli ARGS="capture text hello world"
#   make run-cli ARGS="--help"
run-cli:
	uv run inbox $(ARGS)

# ---------------------------------------------------------------------------
# Build & Test
# ---------------------------------------------------------------------------

build:
	cd web && pnpm build
	@echo "Python server needs no build step (run directly with uv)"

test:
	uv run pytest
	cd web && pnpm test

test-e2e:
	uv run pytest tests/test_e2e.py -v

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

# One-time local PostgreSQL database setup (assumes psql can connect)
setup-db:
	@echo "Creating inbox database and user..."
	psql postgres -c "CREATE USER inbox WITH PASSWORD 'inbox' SUPERUSER;" 2>/dev/null || true
	psql postgres -c "CREATE DATABASE inbox OWNER inbox;" 2>/dev/null || true
	psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE inbox TO inbox;" 2>/dev/null || true
	psql inbox -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null || true
	psql inbox -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;" 2>/dev/null || true
	$(MAKE) migrate
	@echo "Database ready. Run 'make run-server' to start the API."

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------

clean:
	podman-compose down -v 2>/dev/null || true
	rm -rf web/node_modules web/dist .venv
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name '*.pyc' -delete 2>/dev/null || true
