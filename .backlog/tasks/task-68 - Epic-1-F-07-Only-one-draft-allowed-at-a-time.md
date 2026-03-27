---
id: TASK-68
title: '[Epic 1] F-07: Only one draft allowed at a time'
status: To Do
assignee: []
created_date: '2026-03-27 02:51'
labels: []
milestone: m-0
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

As a user, I want to have only one draft block active at a time so that I don't accidentally create multiple incomplete blocks while typing. Notes: While a draft exists, typing more characters appends to the existing draft. The existing draft is focused and scrolled into view. Starting a new draft requires submitting or canceling the current one. Draft is NOT persisted — lost on page refresh.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 When draft exists, typing appends to existing draft (doesn't create new one)
- [ ] #2 Existing draft is focused when typing continues
- [ ] #3 Draft scrolls into view when typing resumes
- [ ] #4 Only one draft can exist at a time
- [ ] #5 Draft is lost on page refresh (not persisted)
<!-- AC:END -->
