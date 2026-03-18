---
id: doc-18
title: Component Library Best Practices
type: other
created_date: '2026-03-18 23:16'
---
# Component Library — Best Practices for This Project

---

## 1. Ground truth: what you're building

From the spec, your UI surface is narrow but non-trivial. The components that need to exist are:

| Component | Variants / states |
|---|---|
| `Block` (container) | text, url, image, file |
| `TextBlock` | collapsed (≤5 lines) / expanded |
| `UrlBlock` | loading / enriched / failed |
| `ImageBlock` | — |
| `FileBlock` | pdf, zip, md, txt, binary |
| `Timestamp` | today / this year / older |
| `Feed` | empty / populated |
| `DropOverlay` | visible / hidden |
| `StorageErrorBanner` | — |
| `ShowMore / ShowLess` | — |

That's roughly 10–12 distinct components. Small enough to build from scratch; complex enough to benefit from structure.

---

## 2. File structure

Co-locate everything per component — this is what your Storybook architecture doc already commits to:

```
src/
  components/
    Block/
      Block.tsx
      Block.stories.tsx
      Block.test.tsx
      index.ts          ← re-export
    TextBlock/
      TextBlock.tsx
      TextBlock.stories.tsx
      TextBlock.test.tsx
      index.ts
    ...
  capture/
    detectType.ts
  storage/
    db.ts
    itemService.ts
```

The `index.ts` barrel per component keeps imports clean: `import { TextBlock } from '@/components/TextBlock'`.

---

## 3. Component template

Yes, a template is worth it. Here's the pattern to follow consistently:

```tsx
// TextBlock.tsx

import type { Item } from '@/storage/db';

interface TextBlockProps {
  item: Item;
}

export function TextBlock({ item }: TextBlockProps) {
  // ...
}
```

Key conventions to lock in now:

- **Props typed inline** — no `FC<Props>`, just the function signature with a named interface
- **`item: Item` as the primary prop** — blocks receive the full storage record, not decomposed fields. This keeps props stable as the schema evolves (e.g. when `meta` lands in Epic 2)
- **No default exports** — named exports only, consistently. Easier to grep and refactor
- **No internal state for data** — blocks are display components; all state lives in `FeedContext`

---

## 4. Storybook as the design contract

Each story maps to an acceptance criterion. For `TextBlock`:

```ts
// TextBlock.stories.tsx

export const ShortText: Story = { ... };         // ≤5 lines, no truncation
export const LongTextCollapsed: Story = { ... }; // >5 lines, "show more" visible
export const LongTextExpanded: Story = { ... };  // after "show more" click
```

This gives you a visual regression target before you write a single test. Build the story first, get it right visually, then write the test against the same scenarios.

---

## 5. Order of build

Follow the dependency graph implied by the user stories:

1. **`Timestamp`** — pure, no deps, good warmup
2. **`TextBlock`** — core block, exercises show/hide logic
3. **`UrlBlock`** — introduces loading/error states (even stubbed for Epic 1)
4. **`ImageBlock`** — mostly layout
5. **`FileBlock`** — introduces icon mapping (Phosphor)
6. **`Block`** — thin dispatcher that renders the right block by type
7. **`Feed`** — composes blocks, handles scroll, empty state
8. **`DropOverlay`** — isolated, stateless
9. **`StorageErrorBanner`** — isolated, stateless

Don't build `Feed` until `Block` is stable. Everything else can be built in any order.

---

## 6. Tailwind conventions to set now

A few decisions that will save pain later:

- Define your feed column width as a Tailwind arbitrary value or a CSS variable — you'll reference it in `ImageBlock` and `FileBlock` for max-width constraints
- Use `text-muted` (or whatever you name your muted token) consistently from day one — `Timestamp`, `UrlBlock` hostname, description text all use it
- Decide on `gap` between blocks in `Feed` and never hardcode it inside a block component

---

## 7. What not to build yet

Consistent with your scope discipline — don't add:

- A `BlockWrapper` with annotation affordances
- Any enrichment status UI (even as a stub)
- Prop variants that don't map to an existing user story

The block interface will evolve cleanly when Epic 2 arrives because `item: Item` as the prop means you just extend the schema, not the component signature.

---

## TL;DR checklist

- [ ] One directory per component, co-located stories + tests
- [ ] Named exports only
- [ ] `item: Item` as primary prop for all block components
- [ ] Build Storybook stories before tests
- [ ] Follow the build order above
- [ ] Lock in Tailwind tokens (column width, muted color) before building blocks
