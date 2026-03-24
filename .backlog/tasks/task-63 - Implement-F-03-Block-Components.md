---
id: TASK-63
title: Implement F-03 Block Components
status: In Progress
assignee: []
created_date: '2026-03-22 09:42'
updated_date: '2026-03-24 00:41'
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
- [ ] #5 FileBlock shows correct Phosphor icon for file type + filename + size
- [ ] #6 Block dispatcher routes items to correct component by type
- [ ] #7 All components have Storybook stories
- [ ] #8 All components have unit tests
- [x] #9 No lint or type errors
- [x] #10 Phosphor Icons dependency installed
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

## FileBlock Test Implementation Notes

Created comprehensive test file at `src/components/FileBlock/FileBlock.test.tsx` following TDD approach:

### Test Coverage

**Rendering Tests (7 tests):**

- Filename display
- File size formatting (B, KB, MB, GB)
- Zero byte handling
- Filenames without extensions
- Multiple dots in filenames

**Icon Tests (6 tests):**

- PDF → FilePdf icon
- ZIP → FileZip icon
- Markdown → FileMd icon
- Text → FileText icon
- Unknown → FileBinary icon
- DOCX → FileBinary icon

**Design System Tests (6 tests):**

- Text tokens: text-xs for size, text-base for filename
- Color tokens: text-text-muted for size, text-text for filename
- Icon accessibility: aria-hidden="true"
- Layout: flex row structure

**Accessibility Tests (2 tests):**

- aria-label with filename and size
- role="group" for semantic structure

**Edge Cases (4 tests):**

- Empty filename handling
- Special characters in filenames
- Unicode filenames
- Long filename truncation

## Block Dispatcher Test Implementation Notes

Created comprehensive test file at `src/components/Block/Block.test.tsx`:

### Test Coverage

**Routing Tests (4 tests):**

- Text items → TextBlock
- URL items → UrlBlock
- Image items → ImageBlock
- File items → FileBlock

**Wrapper Structure Tests (5 tests):**

- Container with data-testid="block-wrapper"
- Consistent padding: py-3, px-4
- Visual separation: border-b border-border
- Type icon in header
- Timestamp in header

**Type-Specific Icons (4 tests):**

- Text → Article icon
- URL → Link icon
- Image → Image icon
- File → File icon

**Design System Tests (7 tests):**

- Background: bg-surface
- Rounded corners: rounded
- Header flex row with gap-2
- Icon color: text-text-muted
- Timestamp: text-sm text-text-muted

**Accessibility Tests (4 tests):**

- role="article"
- aria-label with block type
- Icon aria-hidden
- time element with datetime attribute

**Error Handling (2 tests):**

- Unknown type throws error
- Error fallback rendering

**Edge Cases (8 tests):**

- All metadata subtypes (markdown, code, zip, txt, other)
- Missing optional fields (dimensions, title, favicon)

All tests follow existing patterns from TextBlock and UrlBlock tests.

Created FileBlock.test.tsx with comprehensive tests covering file type icons, filename/size display, design system compliance, accessibility, and edge cases (25 tests total)

Created Block.test.tsx with comprehensive tests covering routing, wrapper structure, type-specific icons, design system compliance, accessibility, error handling, and edge cases (42 tests total)

Tests follow TDD approach - components don't exist yet, tests define expected behavior

<!-- SECTION:NOTES:END -->
