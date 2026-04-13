# Performance Findings Documentation

## Overview

This document contains findings from the performance stress testing infrastructure built for the chaotic-inbox application.

## Test Infrastructure

### What Was Built

1. **Stress Test Suite** (`src/test/performance/`)
   - `data-generators.ts` - Utilities for generating test data (items, files, text)
   - `measure.ts` - Performance measurement utilities (timing, memory, FPS)
   - `stress-tests.test.ts` - Comprehensive stress tests

2. **Development Stress Test Page** (`/dev/performance`)
   - Interactive UI for testing with various load levels
   - Real-time metrics display
   - Configurable item counts (100-10,000)
   - Configurable file sizes (1MB-30MB)
   - Configurable text sizes (1KB-500KB)

3. **Performance Markers** (`src/utils/performance.ts`)
   - Markers for all key operations
   - Console logging of operation timings
   - Predefined marker names for consistency

## How to Run Tests

### Automated Stress Tests

```bash
# Run all performance tests
pnpm test:performance

# Run in watch mode
pnpm test:performance:watch
```

**Note:** These tests create large datasets and may take several minutes to complete. They are intended for on-demand use during development, not for CI.

### Interactive Stress Test Page

1. Start the development server: `pnpm dev`
2. Navigate to: `http://localhost:5173/dev/performance`
3. Use the sliders to configure test parameters
4. Click test buttons to run specific scenarios
5. Monitor results in real-time

## Test Scenarios Covered

### 1. Item List Rendering

- **100 items** - Baseline small dataset
- **1,000 items** - Typical medium dataset
- **5,000 items** - Large dataset
- **10,000 items** - Maximum tested dataset

### 2. File Storage

- **30MB single file** - Large file handling
- **10 x 10MB files** - Multiple large files (100MB total)
- **50 x 5MB files** - Bulk file storage (250MB total)

### 3. Bulk Operations

- **1,000 text items** - Bulk paste simulation
- **5,000 text items** - Large bulk operation
- **100KB/500KB text** - Large content paste
- **20 files dropped** - Simultaneous file drop

### 4. Memory Usage

- Baseline measurements at different item counts
- Memory leak detection tests
- Memory growth tracking

## Performance Markers

The following operations are instrumented with performance markers:

### Paste Operations

- `paste-multiple` - Overall paste operation
- `paste-text` - Text paste
- `paste-image` - Image paste
- `draft-append` - Appending to draft

### Drop Operations

- `drop-files` - File drop handling

### Store Operations

- `store-add-items` - Adding items to store
- `store-load-items` - Loading items from database
- `store-delete-item` - Deleting items
- `store-update-item` - Updating items

### Database Operations

- `db-add` - Database insert
- `db-get-all` - Database fetch all
- `db-delete` - Database delete
- `db-update` - Database update
- `db-export` - Database export
- `db-import` - Database import

### Draft Operations

- `draft-create` - Creating draft
- `draft-submit` - Submitting draft

## Browser Testing Priority

Tests are designed to work with:

1. **Chrome** - Primary target
2. **Firefox** - Secondary target

## Known Limitations

1. **Test Environment** - Stress tests require fake-indexeddb and jsdom, which may not perfectly simulate real browser performance
2. **Memory Measurements** - Memory API may not be available in all test environments
3. **File Generation** - Large file generation (30MB) in tests may consume significant memory

## Running Tests in Browsers

For accurate performance measurements, run the stress test page in actual browsers:

1. Open Chrome DevTools Performance tab
2. Navigate to `/dev/performance`
3. Run tests and capture performance profiles
4. Compare results across browsers

## Next Steps

1. Run tests in actual browsers to collect real performance data
2. Use collected data to set realistic performance budgets
3. Identify bottlenecks that need optimization
4. Consider implementing:
   - Virtual scrolling for large lists
   - Pagination for >1000 items
   - Lazy loading for file previews
   - Worker threads for heavy operations

## Files Changed

- `src/test/performance/data-generators.ts` - Test data generation
- `src/test/performance/measure.ts` - Measurement utilities
- `src/test/performance/stress-tests.test.ts` - Stress test suite
- `src/pages/StressTest.tsx` - Interactive stress test UI
- `src/main.tsx` - Added route for stress test page
- `src/utils/performance.ts` - Performance markers
- `src/hooks/useGlobalPaste.ts` - Added performance markers
- `src/hooks/useGlobalDrop.ts` - Added performance markers
- `src/store/appStore.ts` - Added performance markers
- `package.json` - Added test scripts
