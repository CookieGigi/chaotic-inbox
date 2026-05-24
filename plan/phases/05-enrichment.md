# Phase 5 — Content Enrichment

**Status:** 📋 Planned
**Depends on:** Phase 1 (items in database), Phase 4 (search infrastructure)
**Duration:** 2-3 days
**Goal:** Implement background enrichment pipeline

---

## Deliverables

- [ ] Background worker loop (asyncio polling job_queue)
- [ ] URL metadata enrichment (title, description, favicon)
- [ ] Image dimension extraction
- [ ] AI summarization via local LLM (Ollama)
- [ ] Auto-tagging based on content
- [ ] Auto-categorization based on content
- [ ] Enrichment status tracking per item
- [ ] Retry logic for failed jobs
- [ ] Enrichment tests (pytest with mocked services)

---

## Tasks

### T-01: Background Worker

**File:** `inbox/server/workers/enricher.py`

```python
import asyncio
from datetime import datetime, timezone

async def run_worker(session_factory):
    """Poll job_queue for pending jobs and process them."""
    while True:
        async with session_factory() as session:
            job = await fetch_next_job(session)
            if job:
                await process_job(session, job)
            else:
                await asyncio.sleep(5)  # Poll interval

async def fetch_next_job(session):
    stmt = (
        select(JobQueue)
        .where(JobQueue.status == "pending")
        .where(JobQueue.run_at <= datetime.now(timezone.utc))
        .order_by(JobQueue.run_at)
        .limit(1)
        .with_for_update(skip_locked=True)
    )
    return (await session.execute(stmt)).scalar_one_or_none()
```

- Asyncio-based polling loop (no extra infrastructure)
- `SKIP LOCKED` for concurrent worker safety
- Configurable poll interval (default 5s)
- Graceful shutdown on SIGTERM

### T-02: URL Metadata Enrichment

**File:** `inbox/server/services/enrichment.py`

```python
import httpx
from bs4 import BeautifulSoup

async def enrich_url(session: AsyncSession, item: Item) -> None:
    """Fetch and extract URL metadata."""
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        response = await client.get(item.raw_text)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "lxml")

    title = (
        soup.find("meta", property="og:title")
        or soup.find("title")
    )
    description = (
        soup.find("meta", property="og:description")
        or soup.find("meta", attrs={"name": "description"})
    )
    favicon = soup.find("link", rel="icon")

    item.metadata["title"] = title.get("content", "") if title else ""
    item.metadata["description"] = description.get("content", "") if description else ""
    if favicon:
        item.metadata["favicon"] = favicon.get("href", "")
```

- Respects robots.txt (optional)
- Timeout and retry logic
- Error handling for invalid URLs, 404s, parse failures
- Update enrichment status: `pending → running → done | failed | skipped`

### T-03: Image Dimension Extraction

**File:** `inbox/server/services/enrichment.py`

```python
from PIL import Image

async def enrich_image(session: AsyncSession, item: Item) -> None:
    """Extract image dimensions from blob."""
    if not item.blob_path:
        return

    # Open image from filesystem
    with Image.open(item.blob_path) as img:
        width, height = img.size
        format = img.format
        mode = img.mode

    item.metadata["width"] = width
    item.metadata["height"] = height
    item.metadata["format"] = format
    item.metadata["mode"] = mode
```

- Support PNG, JPEG, GIF, WebP
- Handle corrupted images gracefully

### T-04: AI Summarization

**File:** `inbox/server/services/enrichment.py`

```python
import ollama

async def enrich_ai_summary(session: AsyncSession, item: Item) -> None:
    """Generate AI summary of item content."""
    content = item.raw_text or ""

    response = ollama.chat(
        model="phi3:mini",
        messages=[
            {
                "role": "system",
                "content": "Summarize the following content in 2-3 sentences.",
            },
            {"role": "user", "content": content},
        ],
    )

    summary = response["message"]["content"]
    item.enrichment["summary"] = summary
```

- Use Ollama Python client (local LLM)
- Default model: `phi3:mini` (fast, good quality)
- Configurable model via environment variable
- Timeout and fallback to "skipped" if LLM unavailable
- Respect item length limits (skip very short items)

### T-05: Auto-Tagging

**File:** `inbox/server/services/enrichment.py`

```python
async def auto_tag(session: AsyncSession, item: Item) -> None:
    """Generate tags based on content."""
    # Simple keyword extraction (v0)
    # Future: use LLM for semantic tagging
    content = (item.raw_text or "") + " " + str(item.metadata)
    keywords = extract_keywords(content)  # Simple TF-IDF or regex

    for keyword in keywords[:5]:  # Top 5 tags
        tag = await get_or_create_tag(session, keyword, auto_generated=True)
        item.tags.append(tag)
```

### T-06: Auto-Categorization

**File:** `inbox/server/services/enrichment.py`

```python
async def auto_categorize(session: AsyncSession, item: Item) -> None:
    """Assign item to broad categories."""
    # Simple rule-based (v0)
    # Future: use LLM or classifier
    rules = {
        "Development": ["code", "programming", "git", "api"],
        "Reading": ["article", "blog", "book"],
        "Media": ["image", "video", "music"],
        "Work": ["meeting", "email", "project"],
    }

    content = (item.raw_text or "") + " " + str(item.metadata)
    for category_name, keywords in rules.items():
        if any(kw in content.lower() for kw in keywords):
            category = await get_or_create_category(session, category_name)
            item.categories.append(category)
```

### T-07: Enrichment Status API

**File:** `inbox/server/routers/items.py`

- `GET /v1/items/{id}/enrichment` — Show enrichment status per track
- `POST /v1/items/{id}/enrichment/retry` — Retry failed enrichment
- `POST /v1/items/{id}/enrichment/skip` — Skip pending enrichment

### T-08: CLI Enrichment Commands

```bash
inbox enrich <id> --retry   # Retry failed enrichment
inbox enrich <id> --skip    # Skip pending enrichment
inbox enrich --all          # Trigger enrichment for all items
```

### T-09: Testing

**Files:** `tests/test_enrichment_*.py`

- Mock httpx for URL enrichment tests
- Mock Ollama client for AI tests
- Mock PIL for image tests
- Test retry logic (3 attempts, exponential backoff)
- Test skip logic
- Test concurrent job processing

---

## Stack

| Layer | Technology |
|-------|-----------|
| Worker | asyncio polling loop |
| URL Fetch | httpx + BeautifulSoup4 + lxml |
| Image Processing | Pillow (PIL) |
| AI/LLM | Ollama Python client |
| Auto-Tagging | Simple keyword extraction (v0) |
| Auto-Categorization | Rule-based (v0) |
| Queue | PostgreSQL job_queue table |
| Testing | pytest + mock + async |

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| URL enrichment | > 90% success rate for valid URLs |
| Image dimensions | 100% success for valid images |
| AI summary | Available for items > 100 words |
| Auto-tags | Top 3 tags relevant for 80% of items |
| Job retry | Failed jobs retry up to 3 times |
| Worker throughput | > 10 jobs/minute |
| Test coverage | > 80% |
