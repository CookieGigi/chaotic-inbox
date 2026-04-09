---
id: TASK-113
title: Add Restore button to import database backups
status: Done
assignee: []
created_date: '2026-04-08 04:47'
updated_date: '2026-04-08 05:11'
labels:
  - feature
  - backup
  - restore
  - dexie
  - ui
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add a restore/import functionality to allow users to restore their data from a previously exported backup JSON file. This complements the existing backup feature and provides a complete data management solution.

Technical approach:

- Add restore button to SettingsModal in the Data Management section
- Create file input handler for selecting backup JSON files
- Integrate `dexie-export-import`'s `importDB()` function for importing
- Add confirmation dialog before overwriting existing data
- Implement comprehensive error handling (invalid file format, corrupted data, etc.)
- Add i18n translations for all new UI strings (English/French)
- Show toast notifications for success/error feedback
- Refresh feed/items automatically after successful restore
- Write comprehensive tests for restore functionality
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Restore button visible in SettingsModal Data Management section next to Backup button
- [x] #2 File picker allows selecting `.json` backup files only
- [x] #3 Confirmation dialog shown before importing (warns about overwriting existing data)
- [x] #4 Successful import restores all items to database using importDB()
- [x] #5 Invalid file format shows error toast
- [x] #6 Corrupted backup data shows error toast
- [x] #7 Feed refreshes automatically after successful restore
- [x] #8 All UI strings have i18n translations (en/fr)
- [x] #9 Storybook stories updated with restore functionality
- [x] #10 Comprehensive test coverage for restore functionality (minimum 80%)
- [x] #11 Focus trap in modal includes restore button
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Successfully implemented the restore database functionality:

**Files Created:**

1. `src/services/restoreBackup.ts` - Service function to restore database from JSON backup file
2. `src/services/restoreBackup.test.ts` - Comprehensive tests for restore functionality (29 tests)

**Files Modified:**

1. `src/services/index.ts` - Added export for restoreDatabase
2. `src/i18n/locales/en/translation.json` - Added restore translations
3. `src/i18n/locales/fr/translation.json` - Added French restore translations
4. `src/components/SettingsModal/SettingsModal.tsx` - Added restore button, file input, confirmation dialog
5. `src/components/SettingsModal/SettingsModal.test.tsx` - Updated tests (30 tests)
6. `src/App.tsx` - Integrated restore handler with feed reload

**Implementation Details:**

- Uses `importDB()` from dexie-export-import addon
- File picker restricted to `.json` files only
- Confirmation dialog warns about data replacement
- Validates file format before import
- Closes and reopens database during import
- Error handling for: invalid files, version mismatches, import failures
- Success/error toast notifications via i18n keys
- Feed automatically reloads after successful restore
- Proper focus management in modal (3 focusable elements)
- Full keyboard accessibility (Escape to close/cancel)

**Testing:**

- All 642 tests pass
- 29 new tests for restoreBackup service
- 30 tests for SettingsModal (including restore functionality)

✅ Storybook stories updated with restore functionality (added Open, Closed, BackupOnly, Interactive, WithToastNotification stories)

✅ Comprehensive test coverage achieved - 29 tests for restoreBackup service, 30 tests for SettingsModal (all passing)

<!-- SECTION:FINAL_SUMMARY:END -->
