---
id: TASK-97
title: Add Dexie database backup feature with settings modal
status: In Progress
assignee: []
created_date: '2026-04-07 17:15'
updated_date: '2026-04-07 17:43'
labels:
  - feature
  - backup
  - dexie
  - ui
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Implement a manual backup/export feature for the Dexie database that allows users to download their data as a JSON file. The feature should be accessible through a new settings/options menu button at the bottom right of the screen that opens an extensible modal.

**Context:**

- The app uses Dexie.js (v4.3.0) with a `VaultDB` class storing items in IndexedDB
- The official `dexie-export-import` addon provides `db.export()` method that exports the entire database to a Blob
- The UI uses React 19 + Tailwind CSS v4 + Phosphor Icons
- i18n is set up with react-i18next (English and French)

**Technical approach:**

- Install and use the `dexie-export-import` addon for reliable database export
- Create an extensible settings/options modal component positioned at the bottom right
- Add a menu button that triggers the modal
- Export should generate a downloadable JSON file with timestamp in filename
- Handle Blobs properly (some items contain file/image data)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Install `dexie-export-import` addon as a dependency
- [x] #2 Create an extensible SettingsMenu component with a trigger button positioned at the bottom right of the screen
- [x] #3 Create a SettingsModal component designed to accommodate future options (use tabs or sections)
- [x] #4 Implement export functionality using `db.export()` from dexie-export-import addon
- [x] #5 Export should download a JSON file named `chaotic-inbox-backup-YYYY-MM-DD-HHMMSS.json`
- [x] #6 Export must include all data: text items, URLs, file metadata, and image metadata from the `items` table
- [x] #7 Add i18n translations for all new UI strings (en and fr)
- [x] #8 Settings button should use a suitable Phosphor icon (e.g., Gear or DotsThree)
- [x] #9 Modal should have proper accessibility (aria-label, role="dialog", focus trap)
- [x] #10 Include error handling with user feedback (toast notification) if export fails
<!-- AC:END -->
