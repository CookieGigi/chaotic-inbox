# IndexedDB Schema Migration Strategy

This document describes the migration strategy for handling schema changes in the vault's IndexedDB database after production deployment.

## Overview

The vault uses [Dexie.js](https://dexie.org/) as the IndexedDB wrapper, which provides built-in schema versioning and upgrade mechanisms. Our migration system extends Dexie's capabilities with:

- **Sequential migrations** - Run in version order automatically
- **Data preservation** - User data is never lost during upgrades
- **Validation** - Each migration can validate its own success
- **Error handling** - Failed migrations report detailed errors
- **Progress tracking** - UI can show migration progress
- **Testability** - Comprehensive test utilities for migrations

## Current Schema Version

**Current Version: 1**

```typescript
// Version 1 Schema
{
  items: 'id, capturedAt, type'
}
```

The `items` table stores `RawItem` objects with:

- `id` (UUID) - Primary key
- `capturedAt` (ISO timestamp) - When item was captured
- `type` (string) - Item type: 'text' | 'url' | 'image' | 'file'
- `raw` (string | Blob) - Raw item content
- `metadata` (object) - Type-specific metadata
- `title` (optional string) - Optional title for some types

## Version History

| Version | Changes                  | Migration File           |
| ------- | ------------------------ | ------------------------ |
| 1       | Initial schema           | `local_db.ts`            |
| 2       | Add `updatedAt` field    | `migration.ts` (example) |
| 3       | Add `tags` array support | `migration.ts` (example) |

## Migration Architecture

### Core Components

```
src/storage/
├── migration.types.ts     # TypeScript types for migrations
├── migration.ts          # Migration runner and registry
├── migration.test-utils.ts # Test helpers for migrations
├── migration.test.ts     # Migration unit tests
└── local_db.ts          # Database class with version chain
```

### Migration Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  App Opens  │────▶│ Dexie Checks │────▶│  Version    │
│             │     │   Version    │     │   Match?    │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                           ┌──────No────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Find Needed  │
                    │  Migrations  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐     ┌──────────┐
                    │ Run Migration│────▶│ Validate │
                    │   (in tx)    │     └────┬─────┘
                    └──────────────┘          │
                                              │
                           ┌──────Success─────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Done      │
                    └──────────────┘
```

## How to Create a New Migration

### 1. Define the Migration

Add your migration to the `vaultMigrations` array in `migration.ts`:

```typescript
export const vaultMigrations: Migration[] = [
  // ... existing migrations ...

  {
    version: 4, // Must be > current version
    description: 'Add user preferences to items',
    up: async (db, ctx) => {
      const table = db.table('items')
      let count = 0

      await table.toCollection().modify((item: Record<string, unknown>) => {
        if (!item.preferences) {
          item.preferences = {
            pinned: false,
            archived: false,
          }
          count++
        }
      })

      ctx.log(`Added preferences to ${count} items`)
    },
    validate: async (db) => {
      const items = await db.table('items').toArray()
      return items.every((item) => 'preferences' in item)
    },
  },
]
```

### 2. Update the Schema Version

In `local_db.ts`, add the new version to the constructor:

```typescript
constructor() {
  super('vault')
  registerVaultMigrations(migrationRunner)

  // Version 1
  this.version(1).stores({
    items: 'id, capturedAt, type',
  })

  // Version 2, 3 ... (existing versions)

  // Version 4: Add preferences
  this.version(4)
    .stores({
      items: 'id, capturedAt, type, updatedAt, *tags, preferences.pinned',
    })
    .upgrade(createDexieUpgrade(migrationRunner, 3, 4))
}
```

### 3. Update CURRENT_SCHEMA_VERSION

```typescript
export const CURRENT_SCHEMA_VERSION = 4
```

### 4. Write Tests

Add tests to `migration.test.ts`:

```typescript
describe('v3 to v4 migration', () => {
  let db: Dexie

  beforeEach(async () => {
    db = createDBAtVersion(3)
    await db.open()
    registerVaultMigrations(runner)
    await populateTestData(db, 3, 5)
  })

  afterEach(async () => {
    await cleanupMigrationTest()
  })

  it('adds preferences to all items', async () => {
    const result = await runner.run(db, 3, 4)
    expect(result.success).toBe(true)

    const items = await db.table('items').toArray()
    expect(
      items.every((i: Record<string, unknown>) => 'preferences' in i)
    ).toBe(true)
  })
})
```

## Migration Scenarios

### Adding New Indexes

When adding a new index, Dexie handles this automatically:

```typescript
this.version(2).stores({
  items: 'id, capturedAt, type, newField', // Just add to the list
})
```

### Adding New Fields

When adding new fields to existing data, use a migration:

```typescript
{
  version: 2,
  description: 'Add newField to items',
  up: async (db, ctx) => {
    await db.table('items').toCollection().modify(item => {
      item.newField = defaultValue
    })
  },
}
```

### Changing Field Types

For type changes, migrate data in the `up` function:

```typescript
{
  version: 2,
  description: 'Convert string field to number',
  up: async (db, ctx) => {
    await db.table('items').toCollection().modify(item => {
      if (typeof item.count === 'string') {
        item.count = parseInt(item.count, 10) || 0
      }
    })
  },
}
```

### Splitting Tables

When splitting data into new tables:

```typescript
{
  version: 2,
  description: 'Split metadata into separate table',
  up: async (db, ctx) => {
    // Create new table data
    const metadataItems = await db.table('items').toArray()

    for (const item of metadataItems) {
      await db.table('metadata').add({
        itemId: item.id,
        ...item.metadata,
      })
    }
  },
}
```

### Merging Tables

When merging tables, ensure data is combined correctly:

```typescript
{
  version: 2,
  description: 'Merge settings into items',
  up: async (db, ctx) => {
    const settings = await db.table('settings').toArray()
    const settingsMap = new Map(settings.map(s => [s.itemId, s]))

    await db.table('items').toCollection().modify(item => {
      const settings = settingsMap.get(item.id)
      if (settings) {
        item.settings = settings
      }
    })
  },
}
```

## Rollback Strategy

### Important Limitation

**Dexie/IndexedDB does not support native rollback of schema changes.** Once a migration runs, the schema is updated. However, we implement a "soft rollback" strategy:

### Pre-Migration Backup

```typescript
async function backupBeforeMigration(db: Dexie): Promise<BackupData> {
  const tables = db.tables
  const backup: BackupData = {
    version: db.verno,
    data: {},
    timestamp: new Date().toISOString(),
  }

  for (const table of tables) {
    backup.data[table.name] = await table.toArray()
  }

  return backup
}
```

### Data Recovery

If a migration fails validation, the database is in an inconsistent state. The recommended approach:

1. **Detect failure** - Monitor `MigrationResult.success`
2. **Notify user** - Show error with option to retry
3. **Recovery options**:
   - **Retry**: Attempt migration again (may succeed on transient errors)
   - **Export**: Let user export data before manual recovery
   - **Reset**: Clear database and start fresh (last resort)

```typescript
const result = await migrationRunner.run(db, fromVersion, toVersion)

if (!result.success) {
  // Show user notification
  showMigrationError(result.error)

  // Offer export before reset
  const data = await exportAllData()
  downloadBackup(data)
}
```

## Testing Migrations

### Unit Tests

Use the test utilities:

```typescript
import {
  createDBAtVersion,
  populateTestData,
  validateDataIntegrity,
} from './migration.test-utils'

describe('My Migration', () => {
  let db: Dexie

  beforeEach(async () => {
    db = createDBAtVersion(1)
    await db.open()
    await populateTestData(db, 1, 10) // 10 test items
  })

  it('migrates correctly', async () => {
    const result = await runner.run(db, 1, 2)
    expect(result.success).toBe(true)

    const validation = await validateDataIntegrity(db, 2)
    expect(validation.valid).toBe(true)
  })
})
```

### Integration Tests

Test the full upgrade chain:

```typescript
it('upgrades through all versions', async () => {
  const db = createDBAtVersion(1)
  await db.open()
  await createV1TestData(db)

  // Upgrade to latest
  const result = await runner.run(db, 1, CURRENT_SCHEMA_VERSION)
  expect(result.success).toBe(true)

  // Verify all data intact
  const items = await db.table('items').toArray()
  expect(items.length).toBe(3) // Original count preserved
})
```

## Best Practices

### 1. Always Provide Defaults

When adding new fields, provide sensible defaults:

```typescript
up: async (db, ctx) => {
  await db.table('items').modify((item) => {
    // Good: Provides default
    item.newField = item.newField ?? defaultValue
  })
}
```

### 2. Make Migrations Idempotent

Migrations should be safe to run multiple times:

```typescript
up: async (db, ctx) => {
  await db.table('items').modify((item) => {
    // Good: Checks before modifying
    if (!item.newField) {
      item.newField = defaultValue
    }
  })
}
```

### 3. Keep Migrations Small

Prefer multiple small migrations over one large one:

```typescript
// Good: Two focused migrations
{ version: 2, description: 'Add updatedAt' }
{ version: 3, description: 'Add tags' }

// Avoid: One large migration doing many things
{ version: 2, description: 'Add updatedAt, tags, preferences, etc.' }
```

### 4. Validate Migrations

Always include validation functions:

```typescript
{
  up: async (db, ctx) => { /* ... */ },
  validate: async (db) => {
    const items = await db.table('items').toArray()
    return items.every(item => /* check condition */)
  },
}
```

### 5. Log Migration Progress

Use the context logger for debugging:

```typescript
up: async (db, ctx) => {
  let count = 0
  await db.table('items').modify((item) => {
    // ... modify ...
    count++
  })
  ctx.log(`Updated ${count} items`, 'info')
}
```

## User Notifications

Migrations happen automatically when the app opens. For large migrations that may take time:

```typescript
// In your app initialization
const result = await migrationRunner.run(db, currentVersion, targetVersion, {
  onProgress: (progress) => {
    // Show loading indicator with progress
    showMigrationProgress(progress.percent, progress.message)
  },
})

if (!result.success) {
  showMigrationError(result.error?.message)
}
```

## Troubleshooting

### Migration Not Running

Check that:

1. Version number in `this.version(X)` is higher than previous
2. Migration is registered in `vaultMigrations`
3. `upgrade()` callback is chained to `.stores()`

### Data Loss During Migration

- Verify `modify()` is used (preserves other fields)
- Check that all fields are copied in transformation migrations
- Run data preservation tests: `verifyDataPreservation()`

### Migration Timeout

Increase timeout for large datasets:

```typescript
await runner.run(db, 1, 2, { timeoutMs: 120000 }) // 2 minutes
```

## References

- [Dexie Upgrade Documentation](https://dexie.org/docs/Tutorial/Design#database-versioning)
- [IndexedDB Concepts](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Concepts_Behind_IndexedDB)
- [Migration Test Utils](./migration.test-utils.ts)
