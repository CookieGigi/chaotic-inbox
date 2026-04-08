---
id: TASK-113
title: Add Restore button to import database backups
status: In Progress
assignee: []
created_date: '2026-04-08 04:47'
updated_date: '2026-04-08 04:58'
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
- [ ] #2 File picker allows selecting `.json` backup files only
- [ ] #3 Confirmation dialog shown before importing (warns about overwriting existing data)
- [ ] #4 Successful import restores all items to database using importDB()
- [ ] #5 Invalid file format shows error toast
- [ ] #6 Corrupted backup data shows error toast
- [ ] #7 Feed refreshes automatically after successful restore
- [ ] #8 All UI strings have i18n translations (en/fr)
- [ ] #9 Storybook stories updated with restore functionality
- [ ] #10 Comprehensive test coverage for restore functionality (minimum 80%)
- [ ] #11 Focus trap in modal includes restore button
<!-- AC:END -->
