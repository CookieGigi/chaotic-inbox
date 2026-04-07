# Troubleshooting Guide

Common issues and solutions for production deployment.

## Build Issues

### Build Fails with TypeScript Errors

**Symptom:**

```
error TSXXXX: ...
```

**Solutions:**

1. Run type check separately: `pnpm tsc --noEmit`
2. Fix all type errors before building
3. Check for missing imports or incorrect types

### Build Fails with Missing Dependencies

**Symptom:**

```
Cannot find module 'xxx'
```

**Solutions:**

1. Delete `node_modules/` and reinstall: `rm -rf node_modules && pnpm install`
2. Check `package.json` for missing dependencies
3. Ensure using correct Node.js version (20+)

### Build Output is Too Large

**Symptom:**
`dist/` folder is > 10MB

**Solutions:**

1. Check for large assets (images, videos) in public/
2. Verify tree-shaking is working
3. Check bundle analyzer: Add `build: { rollupOptions: { output: { manualChunks: ... } } }` to vite.config.ts

## Deployment Issues

### 404 on Page Refresh (SPA Routing)

**Symptom:**

- App works on initial load
- Refreshing page shows 404 error

**Cause:**
Server not configured for Single Page Application (SPA) routing.

**Solutions:**

**nginx:**

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

**Caddy:**

```caddyfile
try_files {path} /index.html
```

### App Shows Blank Page

**Symptom:**
White screen after deployment

**Solutions:**

1. Check browser console for errors
2. Verify `dist/index.html` exists
3. Check that assets are loading (404 errors in Network tab)
4. Ensure base path is correct in vite.config.ts:
   ```typescript
   export default defineConfig({
     base: '/', // or '/your-subpath/'
   })
   ```

### Assets Not Loading (404)

**Symptom:**
CSS/JS files return 404

**Solutions:**

1. Check `dist/assets/` folder exists
2. Verify correct Content-Type headers
3. Check for incorrect base path configuration
4. Clear CDN/browser cache

## Runtime Issues

### Paste Not Working

**Symptom:**
Ctrl/Cmd+V doesn't create blocks

**Causes & Solutions:**

1. **HTTP instead of HTTPS:**
   - Clipboard API requires HTTPS in production
   - Solution: Enable HTTPS/SSL

2. **Focus in input field:**
   - Normal behavior - paste works in text inputs
   - Solution: Click outside input, then paste

3. **Browser permissions:**
   - Check browser clipboard permissions
   - Solution: Grant clipboard access in browser settings

### Items Not Persisting

**Symptom:**
Items disappear after refresh

**Causes & Solutions:**

1. **IndexedDB disabled:**
   - Check browser settings for IndexedDB blocking
   - Solution: Enable IndexedDB/storage in browser

2. **Private/Incognito mode:**
   - Some browsers disable IndexedDB in private mode
   - Solution: Use normal browsing mode

3. **Storage quota exceeded:**
   - Check browser storage usage
   - Solution: Clear old data or increase quota

4. **Browser doesn't support IndexedDB:**
   - Check browser compatibility
   - Solution: Use modern browser (Chrome, Firefox, Safari, Edge)

### Drag and Drop Not Working

**Symptom:**
Files can't be dropped into app

**Solutions:**

1. Check for `event.preventDefault()` in drop handlers
2. Verify file types are supported
3. Check browser console for errors
4. Test with different file types

### Performance Issues

**Symptom:**
Slow loading, laggy scrolling

**Solutions:**

1. **Large images:**
   - Compress images before adding
   - Solution: Use smaller images or implement lazy loading

2. **Too many items:**
   - Virtualize long lists
   - Solution: Implement pagination or virtual scrolling

3. **Memory leaks:**
   - Check DevTools Memory tab
   - Solution: Ensure blob URLs are revoked after use

## IndexedDB Issues

### Database Upgrade Failed

**Symptom:**
Console shows migration errors

**Solutions:**

1. Check browser console for specific error
2. Clear site data and reload:
   - Chrome: DevTools > Application > Storage > Clear site data
3. Check migrations.md for upgrade procedures

### Quota Exceeded Error

**Symptom:**

```
QuotaExceededError: The quota has been exceeded.
```

**Solutions:**

1. Clear old items
2. Request persistent storage:
   ```javascript
   navigator.storage.persist()
   ```
3. Check available storage:
   ```javascript
   navigator.storage.estimate().then((estimate) => {
     console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`)
   })
   ```

## Environment Issues

### Environment Variables Not Working

**Symptom:**
App uses wrong configuration

**Solutions:**

1. Variables must be prefixed with `VITE_` to be accessible in browser
2. Restart dev server after changing .env files
3. Check that .env.production exists and is formatted correctly

### Debug Logs in Production

**Symptom:**
Console shows debug messages in production

**Solutions:**

1. Set `VITE_ENABLE_DEBUG_LOGGING=false` in .env.production
2. Rebuild the application
3. Verify **LOG_LEVEL** is set to 2 (error only) in production

## Getting Help

If issues persist:

1. Check browser console for error messages
2. Review [deployment.md](./deployment.md) for setup instructions
3. Check [migrations.md](./migrations.md) for database issues
4. Review test output: `pnpm test`
5. Check CI/CD logs if using automated deployment

## Common Error Messages

| Error                                 | Cause              | Solution                     |
| ------------------------------------- | ------------------ | ---------------------------- |
| `Cannot read properties of undefined` | Null reference     | Check data initialization    |
| `Failed to fetch`                     | Network/CORS issue | Check server configuration   |
| `QuotaExceededError`                  | Storage full       | Clear data or increase quota |
| `SecurityError`                       | Permission denied  | Check HTTPS, permissions     |
| `SyntaxError: Unexpected token`       | Build issue        | Rebuild, check for JS errors |
