---
id: TASK-97
title: Add Dexie database backup feature with settings modal
status: Done
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

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

## Task 97 - Add Dexie Database Backup Feature with Settings Modal

### Summary

Successfully implemented a manual backup/export feature for the Dexie database with a settings modal accessible from the bottom-right corner of the screen.

### Implementation Details

**1. Package Installation**

- Installed `dexie-export-import` v4.4.0 for reliable database export functionality

**2. Components Created**

**SettingsMenu Component** (`src/components/SettingsMenu/`)

- Fixed position button at bottom-right (right-4, bottom-4)
- Uses Wrench icon from Phosphor Icons (as requested)
- Keyboard accessible (Enter/Space to open)
- Proper z-index (z-40) for overlay positioning
- Includes comprehensive tests and Storybook stories

**SettingsModal Component** (`src/components/SettingsModal/`)

- Accessible modal with `role="dialog"` and `aria-modal="true"`
- Custom focus trap implementation (cycles between close and export buttons)
- Escape key to close
- Backdrop click to close
- Focus management: auto-focuses close button on open
- Data Management section with export functionality
- No animation (as requested)
- Includes comprehensive tests and Storybook stories

**Export Backup Service** (`src/services/exportBackup.ts`)

- Uses `exportDB()` from dexie-export-import addon
- Generates filename: `chaotic-inbox-backup-YYYY-MM-DD-HHMMSS.json`
- Exports entire database including all items (text, URLs, files, images)
- Creates downloadable blob
- Error handling with toast notifications

**3. i18n Translations**

- Added translations for all UI strings in English and French:
  - `settings.title`
  - `settings.buttonLabel`
  - `settings.closeButton`
  - `settings.sections.dataManagement`
  - `settings.export.title`
  - `settings.export.description`
  - `settings.export.button`
  - `settings.export.success`
  - `settings.export.error`

**4. Integration**

- Added SettingsMenu and SettingsModal to App.tsx
- Uses React state for modal visibility
- Callback handlers for open/close/export actions

**5. Storybook Stories**

- SettingsMenu.stories.tsx with 3 stories (Default, PositioningDemo, WithLongContent)
- SettingsModal.stories.tsx with 4 stories (Open, Closed, Interactive, WithToastNotification)

### Test Results

- All 37 new tests pass
- All 613 existing tests continue to pass
- Test coverage includes:
  - Component rendering and accessibility
  - User interactions (click, keyboard)
  - Focus management
  - Export functionality (success and error cases)
  - Filename format validation

### Acceptance Criteria Met

✅ All 10 acceptance criteria completed
✅ All tests passing
✅ Storybook stories added for documentation
✅ i18n translations in place
✅ Accessibility features implemented
✅ Error handling with toast notifications

<!-- SECTION:FINAL_SUMMARY:END -->
