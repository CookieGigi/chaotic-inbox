---
id: TASK-79
title: Localize everything
status: Done
assignee: []
created_date: '2026-03-31 19:27'
updated_date: '2026-04-05 08:29'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add localization/internationalization support to the entire application. This includes extracting all user-facing strings, setting up translation infrastructure, and ensuring the UI can be translated into multiple languages.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 All user-facing strings are extracted into translation files
- [x] #2 Translation infrastructure (i18n library) is set up and configured
- [x] #3 At least one additional language is implemented as proof of concept
- [x] #4 UI components properly load translated strings based on user locale
- [x] #5 Documentation is updated with localization guidelines
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

## Implementation Complete

### Summary of Changes

1. **Installed dependencies**: react-i18next, i18next, i18next-browser-languagedetector

2. **Created i18n infrastructure**:
   - `src/i18n/config.ts` - i18next configuration with browser language detection
   - `src/i18n/locales/en/translation.json` - English translations
   - `src/i18n/locales/fr/translation.json` - French translations (proof of concept)
   - `src/i18n/types.d.ts` - TypeScript declarations for JSON imports
   - `src/i18n/resources.ts` - Type exports for translation resources

3. **Updated components to use translations**:
   - `App.tsx` - "Drop files here"
   - `DraftBlock.tsx` - "Draft", "Ctrl+Enter to save, Escape to cancel", keyboard shortcuts
   - `Feed.tsx` - Empty state message, ARIA labels
   - `FileBlock.tsx` - "Size:" with variable interpolation
   - `ErrorBoundary.tsx` - Error messages (refactored to support i18n)
   - `UrlBlock.tsx` - "Open link:" aria-label
   - `Timestamp.tsx` - Locale-aware date formatting

4. **Updated tests**:
   - `src/test/i18n.ts` - Test-specific i18n initialization
   - `src/test/setup.ts` - Initialize i18n for tests
   - `Timestamp.test.tsx` - Updated to pass locale parameter

5. **Created documentation**:
   - `docs/localization.md` - Comprehensive localization guidelines

### Features Implemented

- ✅ Automatic browser language detection
- ✅ Fallback to English for missing translations
- ✅ Language preference persisted in localStorage
- ✅ Locale-aware date/time formatting
- ✅ French translation as proof of concept
- ✅ All user-facing strings extracted to translation files

### Test Results

- All 438 tests passing
- Build successful
- Formatting applied
<!-- SECTION:NOTES:END -->
