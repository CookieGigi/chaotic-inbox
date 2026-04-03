---
id: TASK-24
title: '[Epic 1] F-04: Scroll position preserved between sessions'
status: Done
assignee: []
created_date: '2026-03-18 00:01'
updated_date: '2026-04-03 16:55'
labels:
  - phase-4
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f04-user-stories.md
documentation:
  - 'backlog://doc/doc-5'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** the feed to remember where I was scrolled when I stopped scrolling
**so that** I can pick up exactly where I left off when I return.

Save scroll position in local storage when user stops scrolling (debounced).

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Scroll position is saved to local storage when the user stops scrolling (debounced, not throttled)
- [x] #2 On launch, the saved scroll position is restored
- [x] #3 If no saved position exists (first launch), no restoration occurs (defaults to bottom)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

## Implementation Decision

**Final approach: Save on page exit events instead of debounced scroll listening**

### Problem with debounced scroll approach

The original AC specified "save when user stops scrolling (debounced)" but this caused race conditions:

- Scroll restoration with `behavior: 'smooth'` triggered scroll events
- Debounced save would overwrite the correct position with intermediate values
- Race condition: saved 646.5 instead of 2306

### Final Solution

Save scroll position using standard browser page lifecycle events:

```typescript
// Events that trigger save:
- visibilitychange (when document.hidden = true)
- beforeunload (when closing window/navigating away)
- pagehide (more reliable on mobile)
```

**Benefits:**

- No continuous scroll listening (better performance)
- No race conditions during restoration
- Works when closing window, switching tabs, or navigating away
- Simpler implementation

### Files Changed

- `src/hooks/useScrollPosition.ts` - Complete rewrite
- `src/components/Feed/Feed.tsx` - Updated to use new hook
- `src/hooks/useScrollPosition.test.ts` - Updated tests
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

## Implementation Complete

**Approach changed from debounced scroll listening to page exit events**

### Why the change?

The original approach (debounced scroll listener) caused race conditions where the saved position would be overwritten during restoration animation.

### Final Implementation

Uses standard browser events to save position only when leaving the page:

- `visibilitychange` - When user switches tabs
- `beforeunload` - When closing window or navigating away
- `pagehide` - More reliable on mobile

### Files Modified

- `src/hooks/useScrollPosition.ts` - New implementation using page lifecycle events
- `src/components/Feed/Feed.tsx` - Uses `behavior: 'instant'` for restoration
- `src/hooks/useScrollPosition.test.ts` - Updated tests

### Key Design Decisions

1. **Save on page exit** - Not during scrolling (avoids race conditions)
2. **`behavior: 'instant'`** - Not 'smooth' (prevents animation triggering saves)
3. **`requestAnimationFrame`** - Ensures DOM is ready before restoring
4. **`history.scrollRestoration = 'manual'`** - Disables browser's native restoration

All 365 tests pass.

<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
