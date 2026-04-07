# Deployment Checklist

Use this checklist before deploying to production.

## Pre-Build Checklist

- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] TypeScript compiles without errors (`pnpm tsc --noEmit`)
- [ ] No uncommitted changes (or intentional changes documented)
- [ ] `.env.production` file created and configured

## Build Checklist

- [ ] Build completes without errors (`pnpm build`)
- [ ] `dist/` folder created
- [ ] `dist/index.html` exists
- [ ] `dist/assets/` folder contains JS and CSS files
- [ ] Build size is reasonable (< 5MB total recommended)

## Configuration Checklist

- [ ] `SOURCE_MAP` set appropriately (`false` for most production deployments)
- [ ] `VITE_APP_ENV` set to `production`
- [ ] No debug logging enabled in production
- [ ] Environment file not committed to git (`.env.production` in `.gitignore`)

## Deployment Checklist

- [ ] Files uploaded/copied to server
- [ ] Web server configured correctly
- [ ] HTTPS enabled (required for clipboard API and other features)
- [ ] SPA routing configured (all routes serve index.html)
- [ ] Gzip compression enabled (recommended)
- [ ] Static assets cached appropriately

## Post-Deployment Verification

### Basic Functionality

- [ ] App loads without console errors
- [ ] App title and favicon display correctly
- [ ] No 404 errors in network tab

### Core Features

- [ ] Paste text (Ctrl/Cmd+V) creates text block
- [ ] Paste URL creates URL block
- [ ] Paste image creates image block
- [ ] Drag and drop file creates file block
- [ ] Draft mode: typing creates draft block
- [ ] Submit draft adds item to feed
- [ ] Cancel draft removes draft block

### Data Persistence

- [ ] Items persist after page refresh
- [ ] Items persist after browser restart
- [ ] No data loss observed

### Performance

- [ ] First load time < 3 seconds (on good connection)
- [ ] Subsequent loads fast (cached assets)
- [ ] Scroll performance is smooth
- [ ] No memory leaks (check DevTools Memory tab)

### Error Handling

- [ ] Error boundary catches errors gracefully
- [ ] Console shows no unhandled errors
- [ ] IndexedDB errors handled (test by filling storage)

## Browser Testing (if applicable)

- [ ] Chrome/Edge (Chromium-based)
- [ ] Firefox
- [ ] Safari (if targeting macOS/iOS users)

## Documentation

- [ ] Deployment documented
- [ ] Rollback procedure known
- [ ] Monitoring/alerts configured (if applicable)

## Sign-Off

| Role          | Name | Date | Approved |
| ------------- | ---- | ---- | -------- |
| Developer     |      |      | [ ]      |
| QA            |      |      | [ ]      |
| Product Owner |      |      | [ ]      |

## Notes

- This checklist assumes static file serving deployment
- HTTPS is required for full functionality (clipboard API)
- Keep previous build backup for quick rollback
