# Phase 4 — Search Implementation

**Status:** 📋 Planned
**Depends on:** Phase 1 (items in database)
**Duration:** 2-3 days
**Goal:** Implement full-text and vector search

---

## Deliverables

- [ ] PostgreSQL full-text search (tsvector + GIN index)
- [ ] Vector similarity search with pgvector (cosine distance)
- [ ] Hybrid search combining FTS + vector scores
- [ ] Search API endpoints (`GET /v1/search`, `POST /v1/search/similar`)
- [ ] CLI search command (`inbox search <query>`)
- [ ] Web UI search interface with filters
- [ ] Search result ranking and relevance scoring
- [ ] Search tests (pytest)

---

## Tasks

### T-01: Full-Text Search

**File:** `inbox/server/services/search.py`

Implement PostgreSQL FTS:
```python
async def fulltext_search(
    session: AsyncSession,
    query: str,
    limit: int = 20,
    filters: SearchFilters | None = None,
) -> list[SearchResult]:
    """Full-text search using PostgreSQL tsvector."""
    tsquery = func.plainto_tsquery("english", query)

    stmt = (
        select(Item, func.ts_rank_cd(Item.search_vector, tsquery).label("rank"))
        .where(Item.search_vector.op("@@")(tsquery))
        .where(Item.deleted_at.is_(None))
        .order_by(desc("rank"))
        .limit(limit)
    )
    # ... apply filters
```

- Support `plainto_tsquery` for natural language queries
- Support `websearch_to_tsquery` for Google-style queries (optional)
- Weighted ranking (A: raw_text, B: title, C: description/summary)
- Filter by type, tag, category, date range

### T-02: Vector Search

**File:** `inbox/server/services/search.py`

Implement pgvector similarity:
```python
async def vector_search(
    session: AsyncSession,
    embedding: list[float],
    limit: int = 20,
) -> list[SearchResult]:
    """Vector similarity search using cosine distance."""
    stmt = (
        select(
            Item,
            (1 - Item.embedding.cosine_distance(embedding)).label("similarity"),
        )
        .where(Item.embedding.isnot(None))
        .where(Item.deleted_at.is_(None))
        .order_by(desc("similarity"))
        .limit(limit)
    )
```

- Cosine similarity (most common for sentence embeddings)
- L2 distance (Euclidean) as alternative
- Filter by type, tag, category
- Require embedding to exist (skip unprocessed items)

### T-03: Hybrid Search

**File:** `inbox/server/services/search.py`

Combine FTS + vector:
```python
async def hybrid_search(
    session: AsyncSession,
    query: str,
    limit: int = 20,
) -> list[SearchResult]:
    """Combine FTS relevance + vector similarity."""
    # 1. Generate embedding for query
    query_embedding = await generate_embedding(query)

    # 2. Get FTS results with scores
    fts_results = await fulltext_search(session, query, limit=limit * 2)

    # 3. Get vector results with scores
    vec_results = await vector_search(session, query_embedding, limit=limit * 2)

    # 4. Reciprocal Rank Fusion (RRF)
    # Combine scores: 1/(k + rank)
    # Return top-k merged results
```

- Reciprocal Rank Fusion (RRF) for score combination
- Configurable weights for FTS vs vector
- Fallback to FTS if no embeddings exist

### T-04: Embedding Generation Service

**File:** `inbox/server/services/embeddings.py`

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def generate_embedding(text: str) -> list[float]:
    """Generate 384-dimensional embedding."""
    return model.encode(text, normalize_embeddings=True).tolist()
```

- Load model once at startup (singleton pattern)
- Cache model in blob storage after first download
- Generate embeddings in background worker (job_queue)
- Batch embedding generation for efficiency

### T-05: Search API Endpoints

**File:** `inbox/server/routers/search.py`

```python
@router.get("")
async def search(
    q: str,
    type: str | None = None,
    tag: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
) -> list[SearchResult]:
    """Full-text search."""

@router.post("/similar")
async def similar_search(
    request: SimilarSearchRequest,
) -> list[SearchResult]:
    """Vector similarity search."""
```

### T-06: CLI Search

**File:** `inbox/cli/main.py` — `search` command

```python
@app.command()
def search(
    query: str,
    limit: int = typer.Option(20, "--limit", "-n"),
    json: bool = typer.Option(False, "--json"),
):
    """Search the inbox."""
    client = _client()
    results = client.search(query, limit=limit)
    # Display in Rich table with relevance score
```

### T-07: Web UI Search

**File:** `web/src/components/Search.tsx`

- Search bar with debounce (300ms)
- Filter chips: type, tag, category
- Results list with relevance badge
- Highlight matching terms
- Empty state with suggestions

### T-08: Testing

**Files:** `tests/test_search_*.py`

- Test FTS with various query types
- Test vector search with known embeddings
- Test hybrid search ranking
- Test filters (type, tag, date)
- Test empty results
- Test performance (< 200ms for FTS, < 500ms for vector)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Full-Text Search | PostgreSQL tsvector + GIN |
| Vector Search | pgvector + cosine distance |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Hybrid Ranking | Reciprocal Rank Fusion (RRF) |
| API | FastAPI |
| Testing | pytest + asyncpg |

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| FTS accuracy | Top 3 contains target for 90% of queries |
| Vector recall | Top 5 contains relevant for 80% of queries |
| FTS latency | < 200ms |
| Vector latency | < 500ms |
| Hybrid quality | Better than either alone |
| Test coverage | > 80% |
