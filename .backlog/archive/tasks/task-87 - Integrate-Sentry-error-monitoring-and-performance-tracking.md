---
id: TASK-87
title: Integrate Sentry error monitoring and performance tracking
status: To Do
assignee: []
created_date: '2026-04-04 06:01'
updated_date: '2026-04-04 07:20'
labels:
  - monitoring
  - production
  - error-handling
  - sentry
  - order-4
milestone: m-0
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add Sentry SDK for production error monitoring, performance tracking, and user session replay. This is critical for debugging production issues and understanding user behavior.

**Implementation:**

1. Install @sentry/react and @sentry/vite-plugin
2. Configure Sentry initialization in main.tsx with environment detection
3. Set up error boundary integration with Sentry
4. Add performance monitoring for key user interactions (paste, drop, draft submit)
5. Configure source maps upload for production builds
6. Add user context tracking (anonymized)
7. Set up release tracking for deployment correlation
8. Configure alerts for critical errors

**Configuration:**

- Development: Log to console only (no Sentry)
- Production: Full Sentry integration
- Source maps: Upload during build process
- Privacy: Anonymize user data, respect DNT

**Acceptance Criteria:**

- [ ] Sentry SDK installed and configured
- [ ] Errors from try-catch blocks reported to Sentry (App.tsx:64, 79, 121)
- [ ] Unhandled promise rejections captured
- [ ] Performance metrics for paste/drop/submit operations
- [ ] Source maps uploaded during production build
- [ ] Environment separated in Sentry dashboard
- [ ] Error boundary reports to Sentry
- [ ] Documentation in README for Sentry setup
<!-- SECTION:DESCRIPTION:END -->
