# Chaotic Inbox — Implementation Plan

This directory contains the phased implementation plan for Chaotic Inbox v0.

## Phases

| Phase | Name | Goal | Depends On |
|-------|------|------|------------|
| [00](00-stack.md) | Technical Stack Foundation | Bootstrap all runtimes and tools | — |
| [01](01-domain-api.md) | Domain Model + Database + Core API | Shared types, schema, CRUD API | 00 |
| [02](02-cli.md) | CLI — Capture & Browse | Terminal capture and feed | 00, 01 |
| [03](03-web-ui.md) | Web UI — Capture & Feed | React SPA feed and capture | 00, 01 |
| [04](04-search.md) | Search | FTS + vector search | 01, 02, 03 |
| [05](05-enrichment.md) | Background Enrichment Pipeline | URL metadata, embeddings, categories, summarization | 01, 04 |
| [06](06-management.md) | Management & Export | Tags, categories, backup, settings | 01–05 |

## Execution Rules

1. **One phase at a time**. Complete all tasks, human tests, and auto tests for a phase before moving to the next.
2. **Human testable**. Every phase must be manually verifiable by a human using `curl`, `inbox` CLI, or browser.
3. **Auto testable**. Every phase must have automated tests that pass in CI.
4. **Stack: Rust (axum) + React + PostgreSQL + pgvector**.

## Quick Start

```bash
# Phase 0 only
make dev          # Start everything
curl localhost:8080/health  # Verify API
open localhost:5173        # Verify Web UI
```
