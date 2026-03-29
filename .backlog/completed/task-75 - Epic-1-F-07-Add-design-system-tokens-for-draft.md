---
id: TASK-75
title: '[Epic 1] F-07: Add design system tokens for draft'
status: Done
assignee: []
created_date: '2026-03-27 03:00'
updated_date: '2026-03-29 05:38'
labels:
  - phase-1
  - design-system
milestone: m-0
dependencies: []
references:
  - ./backlog/docs/doc-21
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add CSS custom properties for draft block styling. Includes --color-draft-bg, --color-draft-border, --color-draft-hint, and --text-hint tokens.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 --color-draft-bg added with rgba(30, 32, 48, 0.3)
- [x] #2 --color-draft-border added with rgba(139, 213, 202, 0.5)
- [x] #3 --color-draft-hint references --color-text-faint
- [x] #4 --text-hint added with 12px
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Added CSS custom properties for draft block styling:\n- --color-draft-bg: rgba(30, 32, 48, 0.3) for subtle background\n- --color-draft-border: rgba(139, 213, 202, 0.5) for accent border\n- --color-draft-hint referencing --color-text-faint\n- --text-hint: 12px for instructional text\n\nAll tokens are now available in tokens.css and used throughout the F-07 implementation.

<!-- SECTION:FINAL_SUMMARY:END -->
