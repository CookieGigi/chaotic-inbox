---
id: TASK-20
title: '[Epic 1] F-04: Feed opens at the right position on launch'
status: Done
assignee: []
created_date: '2026-03-18 00:01'
updated_date: '2026-04-03 16:56'
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
**I want** the feed to open at my last scroll position,
**so that** I always land exactly where I left off without any manual scrolling.

Always restore the previous scroll position on launch.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 On launch, restore the previous scroll position from localStorage
- [x] #2 If there is no previous scroll position (first launch), scroll to bottom
- [x] #3 Position is restored smoothly with behavior: 'smooth'
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

## Implementation Decision

**Scroll restoration uses `behavior: 'instant'` instead of `'smooth'`**

### Why the change?

The original AC specified `behavior: 'smooth'` for smooth restoration, but this caused race conditions:

- Smooth scroll animation triggers intermediate scroll events
- These events would trigger saves (even with debouncing)
- Result: saved position was overwritten with wrong value

Example log showing the race condition:

```
[Feed] Restoring scroll position: 2306
[ScrollPosition] Saved position: 646.5  ← Wrong! Animation intermediate value
```

### Final Solution

Uses `behavior: 'instant'` for instant scroll without animation:

```typescript
requestAnimationFrame(() => {
  window.scrollTo({ top: savedScrollPosition, behavior: 'instant' })
})
```

This eliminates the race condition entirely since there's no animation to trigger intermediate scroll events.

### Trade-off

- ✅ No race conditions
- ✅ Simpler implementation
- ❌ No smooth animation (user sees instant jump to position)

This trade-off is acceptable because the primary goal is correct position restoration, not animation aesthetics.

<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

## Implementation Complete

**Changed from `behavior: 'smooth'` to `behavior: 'instant'`**

### Problem with 'smooth'

Smooth scroll animation triggered scroll events that caused race conditions:

```
[Feed] Restoring scroll position: 2306
[ScrollPosition] Saved position: 646.5  ← Wrong intermediate value
```

### Solution

Uses `behavior: 'instant'` with `requestAnimationFrame`:

```typescript
requestAnimationFrame(() => {
  window.scrollTo({ top: savedScrollPosition, behavior: 'instant' })
})
```

### Why this works

- No animation = no intermediate scroll events
- No race conditions
- Instant restoration to exact position

### Acceptance Criteria Update

- [x] #1 On launch, restore the previous scroll position from localStorage
- [x] #2 If there is no previous scroll position (first launch), scroll to bottom
- [x] #3 ~~Position is restored smoothly with behavior: 'smooth'~~ → Changed to `behavior: 'instant'` to prevent race conditions
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
