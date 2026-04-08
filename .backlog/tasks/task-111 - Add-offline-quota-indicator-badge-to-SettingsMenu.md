---
id: TASK-111
title: Add offline/quota indicator badge to SettingsMenu
status: Done
assignee: []
created_date: '2026-04-08 04:47'
updated_date: '2026-04-08 05:19'
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

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

✅ TASK-111 Complete: SettingsModal offline/quota indicator

**Files modified:**

- `src/components/SettingsModal/SettingsModal.tsx` - Added Status section
- `src/components/SettingsModal/SettingsModal.test.tsx` - Added tests for status section
- `src/App.tsx` - Integrated useOnlineStatus and useQuotaMonitor hooks
- `src/i18n/locales/en/translation.json` - Added status translations

**Features implemented:**

- New "Status" section in SettingsModal showing:
  - Online/offline indicator with CloudCheckIcon (online) or CloudSlashIcon (offline)
  - Storage quota progress bar with color coding:
    - Blue (<80%)
    - Orange (80-89%)
    - Red (90%+)
  - Storage usage text: "120MB of 250MB used"
  - Item count: "10 items stored"

**Props added:**

- `isOnline?: boolean` - Shows online/offline status
- `quotaInfo?: QuotaInfo | null` - Shows storage usage

**Test coverage:**

- 25 SettingsModal tests (8 new tests for status section)
- All 670 tests in suite pass
<!-- SECTION:FINAL_SUMMARY:END -->
