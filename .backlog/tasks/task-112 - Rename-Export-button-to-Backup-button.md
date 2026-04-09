---
id: TASK-112
title: Rename Export button to Backup button
status: Done
assignee: []
created_date: '2026-04-08 04:47'
updated_date: '2026-04-08 04:52'
labels:
  - refactor
  - ui
  - i18n
  - backup
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Rename all user-facing "Export" terminology to "Backup" for consistency with the feature's purpose. The functionality remains the same - downloading a JSON backup of the Dexie database - but the UI labels, props, and i18n keys should use "backup" terminology instead of "export".

Technical approach:

- Update i18n translation keys from `settings.export.*` to `settings.backup.*`
- Rename component props: `onExport` → `onBackup`
- Rename refs and test IDs: `exportButtonRef` → `backupButtonRef`, `data-testid="export-button"` → `data-testid="backup-button"`
- Update variable names and test descriptions
- Keep service filenames unchanged (exportBackup.ts describes the technical operation)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Update en/translation.json: rename `settings.export` keys to `settings.backup`
- [x] #2 Update fr/translation.json: rename `settings.export` keys to `settings.backup`
- [x] #3 Update SettingsModal.tsx: rename onExport prop to onBackup, exportButtonRef to backupButtonRef, test ID to backup-button
- [x] #4 Update App.tsx: rename handleExport to handleBackup, update prop name
- [x] #5 Update SettingsModal.test.tsx: update all test assertions and mock names
- [x] #6 All existing tests continue to pass
- [x] #7 UI displays "Backup" instead of "Export"
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Successfully renamed all user-facing "Export" terminology to "Backup" across the codebase:

**Files Modified:**

1. `src/i18n/locales/en/translation.json` - Changed `settings.export` keys to `settings.backup`
2. `src/i18n/locales/fr/translation.json` - Same changes for French translations
3. `src/components/SettingsModal/SettingsModal.tsx` - Renamed `onExport` prop to `onBackup`, `exportButtonRef` to `backupButtonRef`, test ID to `backup-button`
4. `src/App.tsx` - Renamed `handleExport` to `handleBackup`, updated prop name
5. `src/components/SettingsModal/SettingsModal.test.tsx` - Updated all test assertions, mock names, and text expectations
6. `src/services/exportBackup.ts` - Updated i18n keys for success/error messages
7. `src/services/exportBackup.test.ts` - Updated test expectations for new i18n keys
8. `src/components/SettingsModal/SettingsModal.stories.tsx` - Updated Storybook stories with new naming

**Testing:**

- All 613 tests pass
- SettingsModal component tests all pass (17 tests)
- exportBackup service tests all pass
- UI now displays "Backup" instead of "Export"
<!-- SECTION:FINAL_SUMMARY:END -->
