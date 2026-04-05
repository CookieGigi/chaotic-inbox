# Localization Guidelines

This document provides guidelines for adding and maintaining translations in the Chaotic Inbox application.

## Overview

The application uses **react-i18next** for internationalization (i18n) with the following features:

- Automatic browser language detection
- Fallback to English if a translation is missing
- Translation files stored in `src/i18n/locales/`
- Language preference persisted in localStorage

## Supported Languages

| Language | Code | Status           |
| -------- | ---- | ---------------- |
| English  | `en` | Default          |
| French   | `fr` | Proof of concept |

## Project Structure

```
src/i18n/
├── config.ts              # i18next configuration
├── types.d.ts             # TypeScript declarations
├── resources.ts           # Type exports for translations
└── locales/
    ├── en/
    │   └── translation.json
    └── fr/
        └── translation.json
```

## Adding Translations

### 1. Add a New String

Edit `src/i18n/locales/en/translation.json` and add your new key:

```json
{
  "feed": {
    "empty": {
      "message": "Start by pasting text, URLs, images, or dropping files"
    }
  }
}
```

### 2. Use in Components

Import and use the `useTranslation` hook:

```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()

  return <p>{t('feed.empty.message')}</p>
}
```

### 3. Add Interpolation (Variables)

For strings with dynamic values:

```json
{
  "file": {
    "size": "Size: {{size}}"
  }
}
```

Usage:

```tsx
t('file.size', { size: '1.5 MB' })
```

### 4. Translate to Other Languages

Add the corresponding translation to `src/i18n/locales/fr/translation.json`:

```json
{
  "feed": {
    "empty": {
      "message": "Commencez par coller du texte, des URLs, des images ou déposez des fichiers"
    }
  }
}
```

## Key Naming Conventions

Follow these conventions for consistency:

- Use **camelCase** for keys
- Use **dot notation** for nesting (e.g., `block.draft.label`)
- Group by **feature/component** (e.g., `feed`, `block`, `error`)
- Use **descriptive names** that explain the content

### Example Structure

```json
{
  "app": {
    "dropFiles": "Drop files here"
  },
  "block": {
    "draft": {
      "label": "Draft",
      "saveHint": "Ctrl+Enter to save, Escape to cancel"
    }
  },
  "feed": {
    "empty": {
      "message": "Start by pasting text..."
    }
  },
  "error": {
    "title": "Something went wrong"
  }
}
```

## Adding a New Language

1. Create a new folder under `src/i18n/locales/` (e.g., `es/` for Spanish)
2. Copy `translation.json` from the `en` folder
3. Translate all strings
4. Register the language in `src/i18n/config.ts`:

```ts
import esTranslations from './locales/es/translation.json'

i18n.init({
  resources: {
    en: { translation: enTranslations },
    fr: { translation: frTranslations },
    es: { translation: esTranslations }, // Add this
  },
  // ...
})
```

## Changing Language

Use the `i18n` object from `useTranslation`:

```tsx
import { useTranslation } from 'react-i18next'

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <button onClick={() => i18n.changeLanguage('fr')}>Switch to French</button>
  )
}
```

The language preference is automatically saved to localStorage.

## Testing Translations

Run the test suite to ensure translations work:

```bash
pnpm test
```

For manual testing:

1. Change your browser language to French
2. Reload the app
3. Verify all UI strings appear in French

## Date/Time Localization

The `Timestamp` component automatically adapts to the current language:

- English: `Mar 22, 14:30`
- French: `22 mars, 14:30`

The component uses `i18n.language` to determine the locale for date formatting.

## Accessibility

All aria-labels and screen reader text should be translated:

```tsx
// Good
<span className="sr-only">{t('block.draft.keyboardShortcuts')}</span>

// Bad
<span className="sr-only">Keyboard shortcuts:</span>
```

## Best Practices

1. **Always add English first** - It's the fallback language
2. **Keep keys organized** - Group related strings together
3. **Don't hardcode strings** - Use `t()` for all user-facing text
4. **Test with different languages** - Some languages are longer (e.g., German)
5. **Use semantic keys** - `saveButton` is better than `button1`

## Troubleshooting

### Translations not loading

- Check the browser console for errors
- Verify the JSON files are valid (no trailing commas)
- Ensure `src/i18n/config.ts` is imported in `main.tsx`

### TypeScript errors

- Run `pnpm tsc --noEmit` to check for type errors
- Ensure translation keys exist in all language files

## Related Documentation

- [react-i18next documentation](https://react.i18next.com/)
- [i18next documentation](https://www.i18next.com/)
