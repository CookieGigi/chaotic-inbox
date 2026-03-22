# F-03 Block Components Implementation Plan

Based on [doc-4: Epic 1 — F-03: Block Types and Rendering](../.backlog/doc/doc-4.md), [doc-19: Design System](../.backlog/doc/doc-19.md), and [doc-18: Component Library Best Practices](../.backlog/doc/doc-18.md).

---

## Overview

Implement the block rendering system for F-03 (Block Types and Rendering). Each captured item displays as a typed block in the feed with type-specific rendering.

## Component Inventory

| Component    | Purpose                                                | F-03 Tasks       |
| ------------ | ------------------------------------------------------ | ---------------- |
| `Timestamp`  | Relative time display (today/this year/older)          | TASK-23          |
| `TextBlock`  | Plain text with 5-line CSS truncation + Show more/less | TASK-14, TASK-15 |
| `UrlBlock`   | URL with hostname label                                | TASK-13          |
| `ImageBlock` | Inline image rendering                                 | TASK-16          |
| `FileBlock`  | File with type-specific icon + metadata                | TASK-17          |
| `Block`      | Dispatcher that renders correct block by type          | -                |

---

## Build Order

Follow dependency chain from doc-18:

1. **Timestamp** - Pure utility, no dependencies
2. **TextBlock** - Core block functionality
3. **UrlBlock** - Similar complexity to TextBlock
4. **ImageBlock** - Mostly layout
5. **FileBlock** - Introduces icon mapping
6. **Block** - Thin dispatcher, depends on all block types

---

## Technical Specifications

### Props Pattern

All block components receive full `RawItem` (per doc-18):

```tsx
interface TextBlockProps {
  item: RawItem & { type: 'text' }
}

interface UrlBlockProps {
  item: RawItem & { type: 'url' }
}

interface ImageBlockProps {
  item: RawItem & { type: 'image' }
}

interface FileBlockProps {
  item: RawItem & { type: 'file' }
}
```

### Design System Compliance

| Token                | Usage                       |
| -------------------- | --------------------------- |
| `--color-text`       | Body text                   |
| `--color-text-muted` | Timestamps, labels, icons   |
| `--color-accent`     | "Show more/less" affordance |
| `--text-sm`          | Timestamps, labels          |
| `--text-base`        | Block body text             |
| `--text-base-medium` | URL body                    |
| `--space-3` (12px)   | Block vertical padding      |
| `--space-4` (16px)   | Block horizontal padding    |

### Icons (Phosphor Icons)

| Block             | Icon         |
| ----------------- | ------------ |
| TextBlock         | `Article`    |
| UrlBlock          | `Link`       |
| ImageBlock        | `Image`      |
| FileBlock (PDF)   | `FilePdf`    |
| FileBlock (Zip)   | `FileZip`    |
| FileBlock (MD)    | `FileMd`     |
| FileBlock (Txt)   | `FileText`   |
| FileBlock (Other) | `FileBinary` |

### TextBlock Truncation Strategy

**CSS-only approach using `:has()` and checkbox:**

```tsx
// Structure
<label className="block">
  <input type="checkbox" className="peer sr-only" />
  <p className="line-clamp-5 peer-checked:line-clamp-none">{item.raw}</p>
  <span className="text-sm text-accent peer-checked:hidden">Show more</span>
  <span className="text-sm text-accent hidden peer-checked:inline">
    Show less
  </span>
</label>
```

Benefits:

- No React state
- No hydration mismatch
- Instant toggle
- Matches design system "no animation" principle

---

## File Structure

```
src/components/
├── Timestamp/
│   ├── Timestamp.tsx
│   ├── Timestamp.stories.tsx
│   ├── Timestamp.test.tsx
│   └── index.ts
├── TextBlock/
│   ├── TextBlock.tsx
│   ├── TextBlock.stories.tsx
│   ├── TextBlock.test.tsx
│   └── index.ts
├── UrlBlock/
│   ├── UrlBlock.tsx
│   ├── UrlBlock.stories.tsx
│   ├── UrlBlock.test.tsx
│   └── index.ts
├── ImageBlock/
│   ├── ImageBlock.tsx
│   ├── ImageBlock.stories.tsx
│   ├── ImageBlock.test.tsx
│   └── index.ts
├── FileBlock/
│   ├── FileBlock.tsx
│   ├── FileBlock.stories.tsx
│   ├── FileBlock.test.tsx
│   └── index.ts
└── Block/
    ├── Block.tsx
    ├── Block.stories.tsx
    ├── Block.test.tsx
    └── index.ts
```

---

## Implementation Checklist

### Step 1: Timestamp Component

- [ ] Create `src/components/Timestamp/` directory
- [ ] Implement `Timestamp.tsx` with relative time formatting
  - Today: "HH:MM"
  - This year: "Mon DD"
  - Older: "Mon DD, YYYY"
- [ ] Add Storybook stories (today, this year, older)
- [ ] Add unit tests
- [ ] Export from `index.ts`

### Step 2: TextBlock Component

- [ ] Create `src/components/TextBlock/` directory
- [ ] Implement `TextBlock.tsx`
  - Use `Article` icon from Phosphor
  - CSS-only truncation with `line-clamp-5`
  - Hidden checkbox for show more/less toggle
  - "Show more" / "Show less" in `--color-accent`
- [ ] Add Storybook stories
  - Short text (no truncation)
  - Long text (truncated)
  - Long text expanded (show less visible)
- [ ] Add unit tests
- [ ] Export from `index.ts`

### Step 3: UrlBlock Component

- [ ] Create `src/components/UrlBlock/` directory
- [ ] Implement `UrlBlock.tsx`
  - Use `Link` icon from Phosphor
  - Extract hostname from URL
  - Display hostname as muted monospace label
  - Display full URL as `--text-base-medium`
- [ ] Add Storybook stories
  - Simple URL
  - URL with path
  - URL with query params
- [ ] Add unit tests
- [ ] Export from `index.ts`

### Step 4: ImageBlock Component

- [ ] Create `src/components/ImageBlock/` directory
- [ ] Implement `ImageBlock.tsx`
  - Use `Image` icon from Phosphor
  - Create object URL from Blob
  - Constrain to feed column width (max-w-full)
  - Clean up object URL on unmount
- [ ] Add Storybook stories
  - Square image
  - Wide image
  - Tall image
- [ ] Add unit tests
- [ ] Export from `index.ts`

### Step 5: FileBlock Component

- [ ] Create `src/components/FileBlock/` directory
- [ ] Implement `FileBlock.tsx`
  - Map file subtype to Phosphor icon
  - Display filename
  - Display filesize in `--text-xs` muted
- [ ] Add Storybook stories
  - PDF file
  - Zip file
  - Text file
  - Unknown file
- [ ] Add unit tests
- [ ] Export from `index.ts`

### Step 6: Block Dispatcher

- [ ] Create `src/components/Block/` directory
- [ ] Implement `Block.tsx`
  - Accept `item: RawItem` prop
  - Use type guards (`isTextItem`, `isUrlItem`, etc.) to dispatch
  - Render appropriate block component
- [ ] Add Storybook stories
  - Text block
  - URL block
  - Image block
  - File block
- [ ] Add unit tests
- [ ] Export from `index.ts`

### Step 7: Integration & Verification

- [ ] Install Phosphor Icons dependency
- [ ] Verify all components follow design tokens
- [ ] Run Storybook to verify all stories render
- [ ] Run tests: `npm test`
- [ ] Run lint: `npm run lint`
- [ ] Run typecheck: `npm run build` (tsc)

---

## Dependencies to Add

```bash
npm install @phosphor-icons/react
```

---

## Testing Strategy

Per doc-18: Build stories first, then tests against same scenarios.

**Unit Test Coverage:**

- Timestamp: Correct formatting for each time range
- TextBlock: Renders text, truncation CSS applied, toggle works
- UrlBlock: Hostname extraction, full URL display
- ImageBlock: Object URL created, img src set, cleanup on unmount
- FileBlock: Correct icon for subtype, filename/size displayed
- Block: Dispatches to correct component by type

**Storybook Stories:**

- Each component has stories for all visual states
- Stories map to acceptance criteria
- Visual regression baseline

---

## References

- [F-03 Spec: Block Types and Rendering](../.backlog/doc/doc-4.md)
- [Design System](../.backlog/doc/doc-19.md)
- [Component Library Best Practices](../.backlog/doc/doc-18.md)
- [Item & Metadata Model](../.backlog/doc/doc-20.md)
- F-03 Tasks:
  - TASK-13: Pasted URL renders as a URL block
  - TASK-14: Pasted text renders as a text block
  - TASK-15: Long text blocks truncated with show more
  - TASK-16: Pasted image renders inline
  - TASK-17: Dropped non-image file renders with type-specific icon
  - TASK-19: Text with embedded URL renders as text block
  - TASK-23: Each block shows a timestamp
