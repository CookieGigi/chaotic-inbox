---
id: TASK-112
title: Rename Export button to Backup button
status: In Progress
assignee: []
created_date: '2026-04-08 04:47'
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

- [ ] #1 Update en/translation.json: rename `settings.export` keys to `settings.backup`
- [ ] #2 Update fr/translation.json: rename `settings.export` keys to `settings.backup`
- [ ] #3 Update SettingsModal.tsx: rename onExport prop to onBackup, exportButtonRef to backupButtonRef, test ID to backup-button
- [ ] #4 Update App.tsx: rename handleExport to handleBackup, update prop name
- [ ] #5 Update SettingsModal.test.tsx: update all test assertions and mock names
- [ ] #6 All existing tests continue to pass
- [ ] #7 UI displays "Backup" instead of "Export"
<!-- AC:END -->
