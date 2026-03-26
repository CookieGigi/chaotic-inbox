---
id: doc-19
title: Design System
type: other
created_date: '2026-03-18 23:18'
updated_date: '2026-03-26 22:59'
---

# Design System

**Project:** Chaotic Inbox — Personal Knowledge Capture  
**Status:** Draft  
**Version:** 0.3.1  
**Last updated:** 2026-03-26

---

## 1. Design Philosophy

**Functional minimalism.** The UI is a surface for content, not a product in itself. Chrome is reduced to the minimum needed to convey structure. Typography and spacing do the work that colour and decoration would do elsewhere.

The feed is the entire product. Every design decision defers to it.

---

## 2. Colour Palette

Base: **Catppuccin Macchiato**. Dark-first. Light mode is deferred.

### 2.1 Base Tokens

| Token                   | Role                               | Macchiato name | Hex       |
| ----------------------- | ---------------------------------- | -------------- | --------- |
| `--color-bg`            | App background                     | Crust          | `#181926` |
| `--color-surface`       | Block / elevated surface           | Mantle         | `#1e2030` |
| `--color-overlay`       | Drag overlay, modal backdrop       | Base           | `#24273a` |
| `--color-border`        | Divider lines, block borders       | Surface 0      | `#363a4f` |
| `--color-border-subtle` | De-emphasised borders              | Surface 1      | `#494d64` |
| `--color-text`          | Primary text                       | Text           | `#cad3f5` |
| `--color-text-muted`    | Timestamps, labels, secondary text | Subtext 1      | `#a5adcb` |
| `--color-text-faint`    | Placeholder, hint text             | Surface 2      | `#939ab7` |

### 2.2 Semantic / Status Tokens

| Token             | Role                              | Macchiato name | Hex       |
| ----------------- | --------------------------------- | -------------- | --------- |
| `--color-error`   | Storage failure, enrichment error | Red            | `#ed8796` |
| `--color-success` | Write confirmed, enrichment done  | Green          | `#a6da95` |
| `--color-warning` | Quota warning, retry state        | Yellow         | `#eed49f` |
| `--color-accent`  | Interactive elements, focus rings | Teal (default) | `#8bd5ca` |

### 2.3 Accent Customisation

The accent colour is user-configurable. Teal is the default. All accent values reference `--color-accent` — no accent hex appears hardcoded anywhere in component code.

Swapping the accent at runtime is a single operation:

```ts
document.documentElement.style.setProperty('--color-accent', hex)
```

Candidate accent values (all Macchiato). Red, green, and yellow are excluded — those are reserved for semantic tokens and must never be used as accent.

| Name             | Hex       |
| ---------------- | --------- |
| Teal _(default)_ | `#8bd5ca` |
| Lavender         | `#b7bdf8` |
| Sapphire         | `#7dc4e4` |
| Green            | `#a6da95` |
| Mauve            | `#c6a0f6` |
| Pink             | `#f5bde6` |
| Teal             | `#8bd5ca` |
| Sky              | `#91d7e3` |

### 2.4 Accent Usage Reference

Every place `--color-accent` is used in the UI. No other use sites are permitted without updating this table.

| Use case                           | Token                | Notes                         |
| ---------------------------------- | -------------------- | ----------------------------- |
| "Show more / Show less" affordance | `--color-accent`     | Text only, no background      |
| URL click targets                  | `--color-accent`     | Text with hover underline     |
| Drag-and-drop overlay border       | `--color-accent`     | Dashed, 2px, inset 16px       |
| Focus rings                        | `--color-accent`     | 2px solid, 2px offset         |
| Hover on text affordances          | `--color-accent`     | No underline                  |
| "Retry" affordance (Epic 2)        | `--color-accent`     | Text only                     |
| Active toggle / setting (Epic 2)   | `--color-accent`     | Background at reduced opacity |
| Error states                       | `--color-error`      | **Never** `--color-accent`    |
| Success states                     | `--color-success`    | **Never** `--color-accent`    |
| Warning states                     | `--color-warning`    | **Never** `--color-accent`    |
| Timestamps                         | `--color-text-muted` | **Never** `--color-accent`    |
| File / block type icons            | `--color-text-muted` | **Never** `--color-accent`    |

---

## 3. Typography

### 3.1 Font Families

| Role      | Family                 | Source                             |
| --------- | ---------------------- | ---------------------------------- |
| UI / body | **Geist**              | Google Fonts / `geist` npm package |
| Monospace | System monospace stack | No download                        |

Monospace stack:

```css
font-family:
  ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas,
  'DejaVu Sans Mono', monospace;
```

### 3.2 Type Scale

| Token                | Size | Weight | Line height | Usage                              |
| -------------------- | ---- | ------ | ----------- | ---------------------------------- |
| `--text-xs`          | 11px | 400    | 1.4         | Fine print, file size              |
| `--text-sm`          | 13px | 400    | 1.5         | Timestamps, muted labels, hostname |
| `--text-base`        | 15px | 400    | 1.625       | Block body text, URL body          |
| `--text-base-medium` | 15px | 500    | 1.625       | Emphasis                           |
| `--text-label`       | 12px | 500    | 1.4         | Block type labels, icon labels     |

Line height 1.625 (leading-relaxed) provides improved readability for longer body text while maintaining tight rhythm for labels and timestamps.

No display sizes in Epic 1. The feed is body text all the way down.

### 3.3 Usage Rules

- Body text (`text` content): `--text-base`, `--color-text`, line-height 1.625
- Timestamps: `--text-sm`, `--color-text-muted`, monospace; baseline-aligned with header label
- URL hostname label: `--text-sm`, `--color-text-muted`, monospace (passed via `title` metadata)
- URL body: `--text-base`, `--color-accent`, line-height 1.625, hover underline
- File name: `--text-base-medium`, `--color-text` (header only, not repeated in body)
- File body content: `--text-sm`, `--color-text-muted`, prefix "Size: " + formatted size
- "Show more / Show less": `--text-sm`, `--color-accent`
- Error messages: `--text-sm`, `--color-error`
- Empty state: `--text-base`, `--color-text-faint`

---

## 4. Spacing

Base unit: **4px**.

| Token       | Value | Usage                               |
| ----------- | ----- | ----------------------------------- |
| `--space-1` | 4px   | Icon gap, tight inline spacing      |
| `--space-2` | 8px   | Label-to-content gap                |
| `--space-3` | 12px  | Block internal padding (vertical)   |
| `--space-4` | 16px  | Block internal padding (horizontal) |
| `--space-5` | 20px  | Between-block spacing               |
| `--space-6` | 24px  | Feed top/bottom padding             |
| `--space-8` | 32px  | Section-level gaps                  |

---

## 5. Feed Layout

| Property                | Value                                                     |
| ----------------------- | --------------------------------------------------------- |
| Feed max-width          | `720px`                                                   |
| Feed horizontal padding | `--space-4` (16px) on each side                           |
| Feed alignment          | Centred horizontally                                      |
| Block stacking          | Vertical, top-to-bottom, oldest first                     |
| Block separation        | 1px divider line (`--color-border`), no additional margin |

The divider line is the only separator between blocks. No cards, no shadows, no inter-block margin.

---

## 6. Blocks

### 6.1 Shape

| Property      | Value                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| Border radius | `4px`                                                                  |
| Border        | None on individual blocks (feed uses divider lines, not block borders) |
| Background    | Transparent (inherits `--color-bg`)                                    |

Blocks do not have their own background surface. The feed background is the block background. This avoids a "cards in a list" feel and keeps the feed reading as a continuous stream.

Exception: the drag-and-drop overlay uses `--color-overlay` as a full-screen surface.

### 6.2 Block Internal Layout

```
┌─────────────────────────────────────────┐
│  [type icon / label]        [timestamp] │  ← header row, --text-sm, --color-text-muted
│                                         │     timestamp baseline-aligned with label
│  [content]                              │  ← body, --text-base, line-height 1.625
│                                         │
│  [metadata / show more / error]         │  ← footer row, --text-sm
└─────────────────────────────────────────┘
  ─────────────────────────────────────────   ← 1px divider
```

Padding: `--space-3` top/bottom, `--space-4` left/right.

Header alignment: `align-items: baseline` for better text rhythm — timestamp aligns with label text baseline, not icon center.

### 6.3 Per-Type Rendering Summary

| Type    | Header icon            | Header label                 | Content                                                          | Footer                                       |
| ------- | ---------------------- | ---------------------------- | ---------------------------------------------------------------- | -------------------------------------------- |
| `text`  | `Article`              | None                         | Body font, truncated at 5 lines, line-height 1.625               | "Show more" in `--color-accent` if truncated |
| `url`   | `Link`                 | Hostname in monospace, muted | Full URL in `--color-accent`, line-height 1.625, hover underline | Empty (or enrichment state in Epic 2)        |
| `image` | `Image`                | None                         | `<img>` constrained to feed width                                | None                                         |
| `file`  | `File` or subtype icon | Filename                     | "Size: " + formatted size, `--text-sm`, `--color-text-muted`     | Empty                                        |

---

## 7. Icons

Library: **Phosphor Icons** (`@phosphor-icons/react`), MIT licence.

### 7.1 Block Type Icons

One icon per block type, shown in the block header row.

| Block type                | Icon      | Weight  |
| ------------------------- | --------- | ------- |
| `text`                    | `Article` | Regular |
| `url`                     | `Link`    | Regular |
| `image`                   | `Image`   | Regular |
| `file` (generic fallback) | `File`    | Regular |

### 7.2 File Subtype Icons

Shown instead of the generic `File` icon when the dropped file type is known.

| File type      | Icon         | Weight  |
| -------------- | ------------ | ------- |
| PDF            | `FilePdf`    | Regular |
| Zip / archive  | `FileZip`    | Regular |
| Markdown       | `FileMd`     | Regular |
| Plain text     | `FileText`   | Regular |
| Unknown binary | `FileBinary` | Regular |

### 7.3 Usage Rules

- Icon size: `16px` in block headers
- Colour: `--color-text-muted` always — icons never use `--color-accent` or semantic tokens
- No icon is shown for image blocks in the header — the inline image is self-evident

---

## 8. Interactive States

| State                   | Treatment                                                             |
| ----------------------- | --------------------------------------------------------------------- |
| Focus ring              | `2px solid --color-accent`, `2px offset`                              |
| Hover (text affordance) | `--color-accent`, no underline                                        |
| Hover (URL link)        | `--color-accent` with underline, `bg-surface/50` background           |
| Hover (block row)       | Border highlight `border-color: --color-border-subtle` — no animation |
| Disabled                | `--color-text-faint`, `cursor: not-allowed`                           |
| Loading                 | Subtle opacity pulse on the metadata area (no spinner in Epic 1)      |
| Error inline            | `--color-error` text, no background highlight                         |

Block hover state: Subtle border color change to `--color-border-subtle` on the divider line for accessibility. No background color change, no scale, no animation.

---

## 9. Drag-and-Drop Overlay

| Property      | Value                                                       |
| ------------- | ----------------------------------------------------------- |
| Background    | `--color-overlay` at `80%` opacity                          |
| Border        | `2px dashed --color-accent` inset `16px` from viewport edge |
| Label         | Centred, `--text-base`, `--color-text-muted`                |
| Border radius | `4px`                                                       |
| Z-index       | Above all feed content                                      |

---

## 10. Motion

Minimal. No animations for their own sake.

| Interaction        | Treatment                                        |
| ------------------ | ------------------------------------------------ |
| Block append       | No animation — block appears immediately         |
| Feed scroll        | Native smooth scroll (`scroll-behavior: smooth`) |
| "Show more" expand | No animation — content reveals immediately       |
| Overlay appear     | No animation — immediate                         |
| Loading pulse      | `opacity` pulse, `1.5s` ease-in-out, infinite    |
| Hover states       | No transitions or animations — immediate change  |

Motion is intentionally restrained to reinforce the "instant, trustworthy" capture feel. Animation would undermine the write-before-render guarantee by making the append feel like a process.

---

## 11. Decisions Log

| #   | Question            | Decision                                                                     |
| --- | ------------------- | ---------------------------------------------------------------------------- |
| 1   | Colour base         | Catppuccin Macchiato                                                         |
| 2   | Default accent      | Teal (`#8bd5ca`)                                                             |
| 3   | Accent customisable | Yes — references `--color-accent` token only; no hex hardcoded in components |
| 4   | Accent options      | 8 Macchiato colours excluding red, green, yellow (semantic-reserved)         |
| 5   | Status colours      | Red / Green / Yellow from Macchiato palette — never used as accent           |
| 6   | Dark/light          | Dark-first; light mode deferred                                              |
| 7   | Body font           | Geist                                                                        |
| 8   | Monospace font      | System monospace stack (no download)                                         |
| 9   | Feed width          | Max 720px, centred                                                           |
| 10  | Block separation    | 1px divider line (`--color-border`), no card backgrounds                     |
| 11  | Corner radius       | 4px                                                                          |
| 12  | Block background    | Transparent — no card surface                                                |
| 13  | Motion              | Minimal — no decorative animation                                            |
| 14  | Icon colour         | `--color-text-muted` always — no colour-coded icons in Epic 1                |
| 15  | URL styling         | Accent colour with hover underline and background, hostname in header label  |
| 16  | Timestamp alignment | Baseline with header label for better text rhythm                            |
| 17  | Body line height    | 1.625 (leading-relaxed) for improved readability                             |
| 18  | Block hover         | Subtle border highlight (`--color-border-subtle`), no animation              |
| 19  | File block content  | "Size: " prefix + formatted size (filename shown in header only)             |
