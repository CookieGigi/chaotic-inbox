# Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks and [lint-staged](https://github.com/lint-staged/lint-staged) to run checks on staged files only.

## Overview

### Pre-commit Hook

Runs automatically before each commit to ensure code quality:

1. **Type checking** (`tsc --noEmit`) - Verifies TypeScript types
2. **Linting** (`eslint --fix`) - Checks and auto-fixes ESLint issues
3. **Formatting** (`prettier --write`) - Formats code consistently

These checks run **only on staged files** to keep commits fast.

### Pre-push Hook

Runs automatically before each push:

- **Tests** (`npm run test`) - Runs the full test suite

## Bypassing Hooks

### Skip All Hooks

To bypass all hooks for a specific command:

```bash
git commit --no-verify -m "your message"
git push --no-verify
```

### Skip Specific Hooks

To skip only lint-staged (pre-commit):

```bash
SKIP=lint-staged git commit -m "your message"
```

## Troubleshooting

### Hook Not Running

If hooks aren't executing after pulling the repo:

```bash
npm run prepare
```

### Slow Commits

Type checking can add 2-5 seconds per commit. If you need to commit quickly:

```bash
git commit --no-verify -m "quick fix"
```

### Fixing Auto-fixable Issues

Most linting and formatting issues are auto-fixed. If you see changes after committing:

1. Review the changes
2. Stage them: `git add .`
3. Commit again

## Configuration

- **Husky config**: `.husky/`
- **lint-staged config**: `package.json` under `lint-staged`
- **ESLint config**: `eslint.config.js`
- **Prettier config**: `.prettierrc`

## Supported File Types

### Pre-commit checks:

- JavaScript/TypeScript (`.js`, `.jsx`, `.ts`, `.tsx`)
- Type checking, linting, and formatting

### Pre-commit formatting only:

- JSON (`.json`)
- Markdown (`.md`)
- CSS (`.css`)
- HTML (`.html`)
- YAML (`.yaml`, `.yml`)
