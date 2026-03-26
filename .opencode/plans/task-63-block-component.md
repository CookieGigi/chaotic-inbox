# Implementation Plan: Task 63 - Block Component + RawItem Title Property

## Overview

Implement the Block dispatcher component (AC #6) that routes RawItem types to their respective block components with a unified header structure.

## Changes Required

### 1. Update `src/models/metadata.ts`

Add optional `alt` property to `ImageMetadata` interface:

```typescript
export interface ImageMetadata {
  kind: 'image'
  width?: number
  height?: number
  alt?: string // NEW: Alternative text for images
}
```

### 2. Update `src/models/rawItem.ts`

Add optional `title` property to `RawItemBase` or per-type:

- **Text**: `undefined` (no title)
- **Image**: `metadata.alt` (if available, otherwise undefined)
- **Url**: hostname extracted from URL
- **File**: `metadata.filename`

### 3. Create `src/components/Block/Block.test.tsx`

Test coverage for:

- Dispatcher routing by type (AC #6)
- Header structure (icon + label + timestamp)
- Design system compliance (padding, colors, icons)
- Edge cases (URL variations, missing metadata)
- Accessibility (semantic HTML, datetime attributes)

### 4. Create `src/components/Block/Block.tsx`

Main dispatcher component:

- Accept `item: RawItem` prop
- Use type guards from metadata.ts
- Render header with:
  - Type icon (Phosphor icons)
  - Title label (hostname/filename or none)
  - Timestamp component
- Render content with appropriate block component
- Design system: transparent bg, py-3 px-4, border-b border-border

### 5. Create `src/components/Block/index.ts`

Export the Block component.

### 6. Create `src/components/Block/Block.stories.tsx`

Storybook stories for all block types.

## Acceptance Criteria Coverage

- AC #6: Block dispatcher routes items to correct component by type
- Design system compliance (Phosphor icons, focus rings, text tokens)
- All components tested

## Design System References

- Icons: Article, Link, Image, FilePdf, FileZip, FileText, FileBinary (16px, text-muted)
- Header layout: icon | label | timestamp (right-aligned)
- Padding: --space-3 (12px) vertical, --space-4 (16px) horizontal
- Background: transparent
- Border: 1px divider (--color-border)
