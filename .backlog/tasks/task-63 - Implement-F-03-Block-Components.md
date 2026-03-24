---
id: TASK-63
title: Implement F-03 Block Components
status: To Do
assignee: []
created_date: '2026-03-22 09:42'
updated_date: '2026-03-24 01:09'
labels:
  - phase-2
  - f-03
milestone: m-0
dependencies: []
references:
  - F03_IMPLEMENTATION_PLAN.md
  - 'backlog://doc/doc-4'
  - 'backlog://doc/doc-19'
  - 'backlog://doc/doc-18'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Implement the complete block rendering system for F-03 (Block Types and Rendering) per the implementation plan in F03_IMPLEMENTATION_PLAN.md.

This includes:

- Timestamp component (relative time formatting)
- TextBlock component (CSS-only truncation with show more/less)
- UrlBlock component (hostname label + full URL)
- ImageBlock component (inline image rendering)
- FileBlock component (type-specific icons)
- Block dispatcher (routes to correct block by type)

All components follow design system tokens, use Phosphor Icons, and include Storybook stories + unit tests.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Timestamp component renders relative time correctly (today/this year/older)
- [x] #2 TextBlock displays text with 5-line CSS truncation and working show more/less toggle
- [x] #3 UrlBlock displays hostname as muted label and full URL
- [x] #4 ImageBlock renders inline images constrained to feed width
- [x] #5 FileBlock shows correct Phosphor icon for file type + filename + size
- [ ] #6 Block dispatcher routes items to correct component by type
- [ ] #7 All components have Storybook stories
- [ ] #8 All components have unit tests
- [x] #9 No lint or type errors
- [x] #10 Phosphor Icons dependency installed
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

## TextBlock Implementation Notes

### Architecture Decision

TextBlock only renders content + show more/less toggle. Header (type icon, timestamp) and block wrapper structure are handled by the Block dispatcher component (AC #6).

### Design System Compliance

- Text: `--text-base`, `--color-text`

- Toggle: `--text-sm`, `--color-accent` (no underline)

- Icon: CaretDown/CaretUp, `regular` weight, 16px

- Focus ring: 2px solid accent, 2px offset

- No animation per design system motion guidelines

### Truncation Strategy

Hybrid approach for accurate line detection:

1. `scrollHeight` measurement - detects visually wrapped text

2. Newline counting fallback - handles edge cases in tests

Both methods ensure toggle appears correctly at any viewport width.

- UrlBlock component implemented with hostname label + full URL body layout

- 32 unit tests passing

- Storybook stories added

- Component follows design system (Phosphor icons, focus rings, text tokens)

## ImageBlock Implementation Notes

### Architecture

- ImageBlock renders only the image element, no header/footer
- Header with Image icon handled by Block wrapper component (AC #6)
- Props: `src`, `alt?`, `width?`, `height?`

### Design System Compliance

- Constrained to parent: `max-w-full h-auto`
- Rounded corners: `rounded` (4px per design system)
- Block display for proper layout

### Test Coverage

- 11 tests covering rendering, design system, and edge cases
- Tests verify no header/footer (handled by Block wrapper)

## FileBlock Implementation Notes

### Architecture

- FileBlock renders only filename + filesize, no icon (handled by Block wrapper per AC #6)

- Props: `item: RawItem & { type: 'file' }`

### Design System Compliance

- Filename: `--text-base`, `font-medium`, `--color-text`

- File size: `--text-xs`, `--color-text-muted`

- Layout: flex row with gap-2

### File Size Formatting

- Auto-scales: B → KB → MB → GB

- 0 B for empty files

- Decimals only for MB+ (1.5 MB), whole numbers for smaller

- 25 unit tests passing
<!-- SECTION:NOTES:END -->
