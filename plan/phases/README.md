# Chaotic Inbox — Implementation Plan

## Goal
Build the v0 Chaotic Inbox: a personal knowledge capture tool with Python/FastAPI backend, Python/Typer CLI, and React web UI.

---

## Phase Overview

| Phase | Name | Status | Duration | Key Deliverable |
|-------|------|--------|----------|----------------|
| 0 | Foundation | 🔄 In Progress | 1-2 days | Dev env, project skeleton, CI |
| 1 | Domain Model & API | 📋 Planned | 2-3 days | Complete models, REST API, tests |
| 2 | CLI Implementation | 📋 Planned | 2-3 days | Full terminal capture tool |
| 3 | Web UI Implementation | 📋 Planned | 3-4 days | React SPA consuming API |
| 4 | Search Implementation | 📋 Planned | 2-3 days | FTS + vector search |
| 5 | Content Enrichment | 📋 Planned | 2-3 days | Background AI enrichment |
| 6 | Management & Polish | 📋 Planned | 2-3 days | Settings, export, Docker, docs |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.12+, FastAPI, SQLModel, asyncpg |
| **CLI** | Typer, httpx, Rich |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Zustand |
| **Database** | PostgreSQL 17 + pgvector + pg_trgm |
| **Dev Tools** | uv, ruff, pytest, alembic |
| **Infra** | Docker Compose, Nix flake |
| **CI/CD** | GitHub Actions |

---

## Philosophy
- **Zero-friction capture:** Paste, drop, or type — it is saved immediately
- **Chronological feed:** Everything in time order, no folders
- **Background enrichment:** AI processes items after capture (no waiting)
- **Search-first retrieval:** Find by meaning, not by memory
- **CLI + Web:** Terminal for speed, browser for browsing

---

## Phase Details

See individual phase documents:
- [Phase 0 — Foundation](00-stack.md)
- [Phase 1 — Domain Model & API](01-domain-api.md)
- [Phase 2 — CLI Implementation](02-cli.md)
- [Phase 3 — Web UI Implementation](03-web-ui.md)
- [Phase 4 — Search Implementation](04-search.md)
- [Phase 5 — Content Enrichment](05-enrichment.md)
- [Phase 6 — Management & Polish](06-management.md)
