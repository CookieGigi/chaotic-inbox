---
id: TASK-82
title: Fix memory leak in Block.tsx - revoke blob URLs
status: To Do
assignee: []
created_date: '2026-04-01 16:30'
updated_date: '2026-04-04 07:20'
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
