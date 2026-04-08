---
id: TASK-110
title: Add quota monitoring with threshold alerts
status: Done
assignee: []
created_date: '2026-04-08 04:47'
updated_date: '2026-04-08 05:16'
labels:
  - quota
  - storage
  - feature
  - toast
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Implement IndexedDB quota monitoring with toast alerts at storage thresholds.

**Requirements:**

- Create `quotaService.ts` using `navigator.storage.estimate()` API
- Create `useQuotaMonitor.ts` hook that checks quota on mount and every 60 seconds
- Show toast notifications at thresholds:
  - 80%: Warning "Storage 80% full"
  - 90%: Warning "Storage 90% full - consider cleaning up"
  - 95%: Error "Storage 95% full - clean up now"
  - 99%: Error "Storage almost full - clean up immediately"
- Only alert when crossing a threshold, not on every check
- Add i18n keys: `quota.percent80`, `quota.percent90`, `quota.percent95`, `quota.percent99`
- Export from appropriate index files

**Acceptance Criteria:**

- [ ] quotaService retrieves storage estimate and calculates usage percentage
- [ ] useQuotaMonitor checks every 60s and shows toasts at correct thresholds
- [ ] Only shows toast when crossing threshold, not every check
- [ ] Translations added for all 4 messages
- [ ] Unit tests cover service and hook
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

✅ TASK-110 Complete: Quota monitoring with threshold alerts

**Files created:**

- `src/services/quotaService.ts` - Service for storage quota monitoring
- `src/services/quotaService.test.ts` - Unit tests (19 tests)
- `src/hooks/useQuotaMonitor.ts` - React hook with threshold alerts
- `src/hooks/useQuotaMonitor.test.ts` - Unit tests (10 tests)

**Files modified:**

- `src/services/index.ts` - Added quota service exports
- `src/hooks/index.ts` - Added useQuotaMonitor export
- `src/i18n/locales/en/translation.json` - Added quota translations
- `src/store/appStore.ts` - Added trigger for quota check after large file adds
- `src/hooks/useQuotaMonitor.ts` - Listens for 'quotacheck:trigger' events

**Features implemented:**

- `getQuotaInfo()` - Uses navigator.storage.estimate() API
- `formatBytes()` - Formats bytes to "120MB" or "1.5GB"
- `checkThresholds()` - Returns crossed thresholds
- `useQuotaMonitor()` hook:
  - Checks quota on mount and every 60 seconds
  - Shows warning toast at 80%, 90%
  - Shows error toast at 95%, 99%
  - Only alerts when CROSSING a new threshold
  - Provides `checkNow()` for manual checks
  - Listens for 'quotacheck:trigger' event (triggered when adding files >1MB)

**Test coverage:**

- 29 new tests
- All 662 tests in suite pass
<!-- SECTION:FINAL_SUMMARY:END -->
