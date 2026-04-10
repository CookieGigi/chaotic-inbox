---
id: TASK-105
title: Add offline/quota indicator to SettingsMenu
status: To Do
assignee: []
created_date: '2026-04-08 04:45'
labels:
  - ui
  - component
  - offline
  - quota
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Update SettingsMenu component to show visual indicator for offline status and quota warnings.

**Requirements:**

- Accept props: `isOnline: boolean` and `quotaPercent: number | null`
- Show `CloudSlashIcon` (from @phosphor-icons/react) when offline
- Show colored dot indicator when quota warning:
  - Orange at 80-89%
  - Red at 90%+
- Position indicator as badge/overlay on the settings button
- Keep existing button functionality unchanged

**Acceptance Criteria:**

- Shows CloudSlashIcon when isOnline=false
- Shows orange dot when quotaPercent >= 80
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Shows CloudSlashIcon when isOnline=false
- [ ] #2 Shows orange dot when quotaPercent 80-89%
- [ ] #3 Shows red dot when quotaPercent >= 90%
- [ ] #4 Shows nothing when online and quota < 80%
- [ ] #5 Indicator positioned clearly on/near button
- [ ] #6 Component tests verify all states
- [ ] #7 No regression in existing button functionality
<!-- AC:END -->
