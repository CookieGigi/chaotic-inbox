---
id: TASK-82
title: Fix memory leak in Block.tsx - revoke blob URLs
status: Done
assignee: []
created_date: '2026-04-01 16:30'
updated_date: '2026-04-05 05:42'
labels:
  - bug
  - memory-leak
  - image-block
  - order-2
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

When rendering image blocks, `URL.createObjectURL` creates blob URLs that are never revoked, causing memory leaks on re-render or unmount.

**Location**: `src/components/Block/Block.tsx:29-32`

**Current code**:

```tsx
if (isImageItem(item)) {
  const objectUrl = URL.createObjectURL(blob)
  return <ImageBlock src={objectUrl} ... />
}
```

**Fix**: Use `useEffect` with cleanup or useMemo to track and revoke the URL when component unmounts or item changes.

<!-- SECTION:DESCRIPTION:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [x] #1 Blob URLs are properly revoked when component unmounts or blob changes
- [x] #2 TypeScript types are correctly handled for ImageMetadata
- [x] #3 useMemo prevents unnecessary blob URL creation on re-renders
<!-- DOD:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Fixed memory leak in Block.tsx where blob URLs were never revoked.

**Changes made:**

1. Created a new `ImageBlockContent` component that encapsulates image rendering logic
2. Used `useMemo` to create the blob URL only when the blob actually changes
3. Used `useEffect` with cleanup to revoke the blob URL when the component unmounts or when the blob changes
4. Added proper TypeScript import for `ImageMetadata` type

**Before:**

- `URL.createObjectURL(blob)` was called on every render
- Created blob URLs were never cleaned up, causing memory leaks

**After:**

- Blob URL is only created once per unique blob (via `useMemo`)
- Blob URL is properly revoked when component unmounts or blob changes (via `useEffect` cleanup)
- Memory is properly managed and leaks are prevented
<!-- SECTION:FINAL_SUMMARY:END -->
