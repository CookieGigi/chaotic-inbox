---
id: TASK-71
title: '[Epic 1] F-07: Implement DraftBlock component with styling'
status: Done
assignee: []
created_date: '2026-03-27 02:59'
updated_date: '2026-03-29 05:38'
labels:
  - phase-2
  - components
  - styling
milestone: m-0
dependencies: []
references:
  - ./backlog/docs/doc-21
documentation:
  - 'backlog://doc/doc-21'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create a DraftBlock wrapper component that renders TextBlockEdit with draft-specific visual styling. The component should display hint text below the textarea, apply draft background color (30% opacity surface), apply draft border color (50% opacity accent), show accent border on focus with subtle shadow, and match existing block header layout with Article icon.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Renders with --color-draft-bg (30% surface opacity)
- [x] #2 Renders with --color-draft-border (50% accent opacity)
- [x] #3 Focus state uses full --color-accent border with 2px focus ring
- [x] #4 Hint text displays below textarea: Ctrl+Enter to save, Escape to cancel
- [x] #5 Uses --text-hint (12px) and --color-draft-hint styling
- [x] #6 Block header shows Article icon and current timestamp
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Created DraftBlock component that:\n- Wraps TextBlockEdit with draft-specific visual styling\n- Uses --color-draft-bg (30% opacity) and --color-draft-border (50% accent)\n- Shows hint text: Ctrl+Enter to save, Escape to cancel\n- Displays Article icon and current timestamp in header\n- Auto-scrolls into view on mount\n- Applies accent border and focus ring on focus\n\nComponent fully styled according to design system specifications.

<!-- SECTION:FINAL_SUMMARY:END -->
