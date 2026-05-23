# Phase 0: Technical Stack Foundation

**Goal**: Bootstrap every runtime and tool so the entire team can `make dev` and have everything running.

## Dependencies
None. This is the first phase.

## Tasks

| # | Task | Detail |
|---|------|--------|
| 0.1 | Update `flake.nix` | Add Rust toolchain: `cargo`, `rustc`, `rust-analyzer`, `rustfmt`, `clippy`, `pkg-config`, `openssl`, `sqlx-cli`. Keep existing Node/Python tooling. The flake must provide a single `nix develop` shell with Rust + Node + Python + Postgres client tools. |
| 0.2 | Cargo workspace | Root `Cargo.toml` with `[workspace]` members: `crates/domain/`, `server/`, `cmd/inbox/`. Each crate has its own `Cargo.toml` with shared dependencies at workspace level: `tokio`, `serde`, `axum`, `sqlx`, `clap`, `reqwest`, `uuid`, `chrono`, `tracing`. Use `resolver = "2"`. |
| 0.3 | pnpm workspace | `web/` directory with Vite + React 19 + TypeScript. Dependencies: `@tanstack/react-query`, `zustand`, `@tanstack/react-virtual`, `tailwindcss` (v4), `phosphor-react`. Root `pnpm-workspace.yaml`, shared `tsconfig.json` in `web/tsconfig.json`. |
| 0.4 | Docker Compose | `docker-compose.yml` with `pgvector/pgvector:pg16` image. Service: `postgres`. Expose port `5432`. Named volume `postgres_data` for persistence. Healthcheck: `pg_isready -U inbox -d inbox`. Environment: `POSTGRES_USER=inbox`, `POSTGRES_PASSWORD=inbox`, `POSTGRES_DB=inbox`. |
| 0.5 | SQLx migrations scaffold | `server/migrations/` directory. Migration tool: `sqlx-cli`. First migration: `0001_init.sql` creating `items`, `tags`, `item_tags`, `categories`, `item_categories`, `job_queue` tables with all indexes. The migration must include `CREATE EXTENSION IF NOT EXISTS pgvector; CREATE EXTENSION IF NOT EXISTS pg_trgm;`. |
| 0.6 | Lint & Format configs | `rustfmt.toml` at root (spaces over tabs, max_width 100, reorder_imports). ESLint + Prettier configs in `web/` (flat config, TypeScript-aware). `.editorconfig` at root. Pre-commit hooks optional via `.githooks/` or `lefthook`. |
| 0.7 | Makefile | Targets: `make dev` (docker up + sqlx migrate + cargo watch + pnpm dev), `make build` (cargo build --release + pnpm build), `make test` (cargo test + pnpm test), `make lint` (cargo clippy + pnpm lint), `make fmt` (cargo fmt + pnpm fmt), `make migrate` (sqlx migrate run), `make clean` (docker down + rm target + rm node_modules). |
| 0.8 | CI skeleton | `.github/workflows/ci.yml`: lint, test (cargo test + pnpm test), build on push/PR. Matrix: stable Rust on ubuntu-latest. Cache `target/` and `~/.cargo`. Cache `pnpm` store. |

## Human Test Checklist

- [ ] Run `nix develop` → shell has `cargo --version`, `node --version`, `pnpm --version`, `sqlx --version`
- [ ] Run `make dev` → Docker Compose starts Postgres, `docker ps` shows healthy `postgres` container
- [ ] `make migrate` → `sqlx migrate run` completes with no errors
- [ ] `cargo build` in workspace root → compiles all crates with zero errors
- [ ] `pnpm install && pnpm build` in `web/` → builds successfully
- [ ] `make test` → cargo test passes (placeholder tests OK), pnpm test passes (placeholder tests OK)
- [ ] `make lint` → clippy clean, eslint clean
- [ ] `make fmt` → no changes (already formatted)
- [ ] `curl localhost:8080/health` → returns `{"status":"ok"}` (placeholder health endpoint)

## Auto Test Checklist

- [ ] CI pipeline green on PR — all jobs pass
- [ ] Cargo workspace compiles in CI
- [ ] `sqlx migrate run` succeeds in CI (uses service container or test DB)
- [ ] pnpm workspace installs and builds in CI

## Deliverable

A single-command development environment. `make dev` starts everything. All tools compile and pass trivial tests. The foundation is solid for Phase 1.
