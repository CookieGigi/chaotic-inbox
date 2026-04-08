---
id: TASK-111
title: Add offline/quota indicator badge to SettingsMenu
status: To Do
assignee: []
created_date: '2026-04-08 04:47'
labels:
  - ui
  - component
  - offline
  - quota
  - feature
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add visual indicator badge to SettingsMenu button showing offline status or quota warning.

**Requirements:**

- Update SettingsMenu component to accept props: `isOnline: boolean`, `quotaPercent: number | null`
- Show `CloudSlashIcon` (from @phosphor-icons/react) when offline
- Show colored dot indicator for quota:
  - Orange dot at 80-89%
  - Red dot at 90%+
- Position as badge/overlay on settings button
- Integrate into App.tsx: call useOnlineStatus() and useQuotaMonitor(), pass values to SettingsMenu

**Acceptance Criteria:**

- [ ] SettingsMenu shows CloudSlashIcon when offline
- [ ] SettingsMenu shows orange dot at 80-89% quota
- [ ] SettingsMenu shows red dot at 90%+ quota
- [ ] App.tsx integrates hooks and passes props to SettingsMenu
- [ ] Component tests verify all indicator states
- [ ] No regression in existing button functionality
<!-- SECTION:DESCRIPTION:END -->
