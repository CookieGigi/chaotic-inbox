# Deployment Guide

This guide covers deploying Chaotic Inbox to production using static file serving.

## Prerequisites

- Node.js 20+
- pnpm 9+
- A web server to serve static files

## Build Process

### 1. Install Dependencies

```bash
pnpm install --frozen-lockfile
```

### 2. Set Environment Variables

Copy the production environment template:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with your values (see [Environment Configuration](#environment-configuration)).

### 3. Build for Production

```bash
pnpm build
```

This creates a `dist/` folder with optimized static files.

### 4. Verify Build

```bash
# Check that dist/ was created
ls -la dist/

# Should contain:
# - index.html
# - assets/ (JS, CSS, images)
```

## Serving Static Files

### Option A: Python (Simplest)

```bash
# Python 3
cd dist && python -m http.server 8080

# Access at: http://localhost:8080
```

### Option B: Node.js (serve)

```bash
# Install serve globally (or use npx)
npm install -g serve

# Serve the dist folder
serve dist -l 8080

# Access at: http://localhost:8080
```

### Option C: nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Option D: Caddy (Automatic HTTPS)

```caddyfile
your-domain.com {
    root * /path/to/dist
    file_server
    try_files {path} /index.html
}
```

### Option E: Apache

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/dist

    <Directory /path/to/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Enable gzip
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/css application/javascript
    </IfModule>
</Directory>
```

Add `.htaccess` in `dist/` for SPA routing:

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

## Environment Configuration

Create `.env.production` from the template:

```bash
cp .env.production.example .env.production
```

Available variables:

| Variable       | Default      | Description                        |
| -------------- | ------------ | ---------------------------------- |
| `SOURCE_MAP`   | `false`      | Generate source maps for debugging |
| `VITE_APP_ENV` | `production` | Application environment            |

## HTTPS Requirement

**Important:** Several browser features require HTTPS in production:

- Clipboard API (paste functionality)
- Camera access
- Geolocation
- Service Workers

For local testing, HTTP is fine. For production deployment, use HTTPS.

### Free HTTPS Options

- **Caddy**: Automatic HTTPS with Let's Encrypt
- **Cloudflare**: Free SSL/TLS proxy
- **Let's Encrypt**: Free certificates

## Production Checklist

Before deploying, verify:

- [ ] Build completes without errors
- [ ] All tests pass (`pnpm test`)
- [ ] Environment variables configured
- [ ] HTTPS enabled (for production)
- [ ] Error boundary working
- [ ] IndexedDB persists data
- [ ] Paste/drop functionality works

See [deployment-checklist.md](./deployment-checklist.md) for complete list.

## Post-Deployment Verification

After deploying, test:

1. **Basic functionality**: App loads without errors
2. **Data persistence**: Add item, refresh page, item still there
3. **Paste**: Copy text, paste with Ctrl/Cmd+V
4. **Drop**: Drag file into app
5. **Error handling**: Check browser console for errors

## Troubleshooting

See [troubleshooting.md](./troubleshooting.md) for common issues.

## Updating Production

To update the deployed application:

1. Pull latest code: `git pull origin main`
2. Install dependencies: `pnpm install --frozen-lockfile`
3. Build: `pnpm build`
4. Replace old `dist/` with new one
5. Verify deployment

## Rollback

If a deployment fails:

1. Keep previous `dist/` backup
2. Restore backup: `cp -r dist-backup/ dist/`
3. Restart server

For database issues, see [migrations.md](./migrations.md) for rollback procedures.
