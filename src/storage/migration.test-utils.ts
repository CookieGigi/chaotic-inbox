import 'fake-indexeddb/auto'
import { Dexie } from 'dexie'
import type {
  Migration,
  MigrationConfig,
  MigrationContext,
  MigrationResult,
} from './migration.types'
import { MigrationRunner } from './migration'

/**
 * Creates a test database at a specific version for migration testing.
 * This simulates an existing database with data at the specified version.
 */
export function createDBAtVersion(version: number): Dexie {
  // Delete any existing database
  indexedDB.deleteDatabase('test-vault-migration')

  const db = new Dexie('test-vault-migration')

  // Define schema based on version
  if (version === 1) {
    db.version(1).stores({
      items: 'id, capturedAt, type',
    })
  } else if (version === 2) {
    db.version(1).stores({
      items: 'id, capturedAt, type',
    })
    db.version(2).stores({
      items: 'id, capturedAt, type, updatedAt',
    })
  } else if (version >= 3) {
    db.version(1).stores({
      items: 'id, capturedAt, type',
    })
    db.version(2).stores({
      items: 'id, capturedAt, type, updatedAt',
    })
    db.version(3).stores({
      items: 'id, capturedAt, type, updatedAt, *tags',
    })
  }

  return db
}

/**
 * Populates a test database with sample data matching a specific schema version.
 */
export async function populateTestData(
  db: Dexie,
  version: number,
  itemCount: number = 5
): Promise<string[]> {
  const items: Array<Record<string, unknown>> = []
  const ids: string[] = []

  for (let i = 0; i < itemCount; i++) {
    const id = crypto.randomUUID()
    ids.push(id)

    const item: Record<string, unknown> = {
      id,
      capturedAt: new Date(Date.now() - i * 1000).toISOString(),
      type: i % 2 === 0 ? 'text' : 'url',
      raw: `Test content ${i}`,
      metadata: { kind: 'plain' },
    }

    // Version 2+ fields
    if (version >= 2) {
      item.updatedAt = item.capturedAt
    }

    // Version 3+ fields
    if (version >= 3) {
      item.tags = i % 3 === 0 ? ['test', 'sample'] : []
    }

    items.push(item)
  }

  await db.table('items').bulkAdd(items)
  return ids
}

/**
 * Validates that all items have the expected fields for a given version.
 */
export async function validateDataIntegrity(
  db: Dexie,
  version: number
): Promise<{ valid: boolean; errors: string[] }> {
  const items = await db.table('items').toArray()
  const errors: string[] = []

  for (const item of items) {
    // Common fields (all versions)
    if (!item.id) errors.push(`Item missing id: ${JSON.stringify(item)}`)
    if (!item.capturedAt) errors.push(`Item ${item.id} missing capturedAt`)
    if (!item.type) errors.push(`Item ${item.id} missing type`)

    // Version 2+ validations
    if (version >= 2 && !('updatedAt' in item)) {
      errors.push(
        `Item ${item.id} missing updatedAt (required for v${version})`
      )
    }

    // Version 3+ validations
    if (version >= 3) {
      if (!('tags' in item)) {
        errors.push(`Item ${item.id} missing tags (required for v${version})`)
      } else if (!Array.isArray(item.tags)) {
        errors.push(`Item ${item.id} tags is not an array`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Creates a mock migration for testing.
 */
export function createMockMigration(
  version: number,
  description: string,
  upImplementation: (db: Dexie, ctx: MigrationContext) => Promise<void>,
  shouldFail: boolean = false
): Migration {
  return {
    version,
    description,
    up: shouldFail
      ? async () => {
          throw new Error(`Mock migration ${version} failed`)
        }
      : upImplementation,
    validate: shouldFail
      ? undefined
      : async (db) => {
          const items = await db.table('items').toArray()
          return items.length > 0
        },
  }
}

/**
 * Runs a migration with test configuration.
 */
export async function runMigrationTest(
  runner: MigrationRunner,
  db: Dexie,
  fromVersion: number,
  toVersion: number,
  config?: Partial<MigrationConfig>
): Promise<MigrationResult> {
  const progressUpdates: Array<{ step: string; percent: number }> = []

  const result = await runner.run(db, fromVersion, toVersion, {
    dryRun: false,
    timeoutMs: 5000,
    onProgress: (progress) => {
      progressUpdates.push({ step: progress.step, percent: progress.percent })
    },
    ...config,
  })

  // Attach progress updates to result for assertions
  return {
    ...result,
    logs: [
      ...result.logs,
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Progress updates: ${progressUpdates.length}`,
        version: toVersion,
      },
    ],
  }
}

/**
 * Creates test data that simulates v1 schema (before migrations).
 */
export async function createV1TestData(db: Dexie): Promise<string[]> {
  const ids: string[] = []

  const items = [
    {
      id: crypto.randomUUID(),
      capturedAt: '2026-01-01T00:00:00.000Z',
      type: 'text',
      raw: 'First test item',
      metadata: { kind: 'plain', wordCount: 3 },
    },
    {
      id: crypto.randomUUID(),
      capturedAt: '2026-01-02T00:00:00.000Z',
      type: 'url',
      raw: 'https://example.com',
      metadata: { kind: 'url', title: 'Example' },
    },
    {
      id: crypto.randomUUID(),
      capturedAt: '2026-01-03T00:00:00.000Z',
      type: 'image',
      raw: new Blob(['test'], { type: 'image/png' }),
      metadata: { kind: 'image', width: 100, height: 100 },
    },
  ]

  for (const item of items) {
    ids.push(item.id)
    await db.table('items').add(item)
  }

  return ids
}

/**
 * Verifies that data is preserved during migration.
 */
export async function verifyDataPreservation(
  db: Dexie,
  originalIds: string[]
): Promise<{ preserved: boolean; missingIds: string[] }> {
  const currentItems = await db.table('items').toArray()
  const currentIds = new Set(currentItems.map((i: { id: string }) => i.id))

  const missingIds = originalIds.filter((id) => !currentIds.has(id))

  return {
    preserved: missingIds.length === 0,
    missingIds,
  }
}

/**
 * Cleanup helper for migration tests.
 */
export async function cleanupMigrationTest(): Promise<void> {
  indexedDB.deleteDatabase('test-vault-migration')
}
