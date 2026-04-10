---
id: TASK-107
title: Add i18n translations for offline and quota
status: To Do
assignee: []
created_date: '2026-04-08 04:45'
labels:
  - i18n
  - translations
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add translation keys for offline status and quota alerts.

**Add to src/i18n/locales/en/translation.json:**

**Offline keys:**

- `offline.status.offline`: "You're offline"
- `offline.status.online`: "Back online"

**Quota keys:**

- `quota.percent80`: "Storage 80% full"
- `quota.percent90`: "Storage 90% full - consider cleaning up"
- `quota.percent95`: "Storage 95% full - clean up now"
- `quota.percent99`: "Storage almost full - clean up immediately"

**Acceptance Criteria:**

- All translation keys added to en/translation.json
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 All 6 translation keys added
- [ ] #2 Keys follow existing naming convention
- [ ] #3 No duplicate keys created
<!-- AC:END -->
