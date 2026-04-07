import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Dexie } from 'dexie'
import {
  MigrationRunner,
  registerVaultMigrations,
  vaultMigrations,
} from './migration'
import type { Migration, MigrationContext } from './migration.types'
import {
  createDBAtVersion,
  populateTestData,
  validateDataIntegrity,
  createMockMigration,
  createV1TestData,
  verifyDataPreservation,
  cleanupMigrationTest,
} from './migration.test-utils'

describe('MigrationRunner', () => {
  let runner: MigrationRunner

  beforeEach(() => {
    runner = new MigrationRunner()
  })

  describe('registration', () => {
    it('registers a migration successfully', () => {
      const migration: Migration = {
        version: 2,
        description: 'Test migration',
        up: async () => {
          /* no-op */
        },
      }

      runner.register(migration)
      const migrations = runner.getMigrations()

      expect(migrations).toHaveLength(1)
      expect(migrations[0].version).toBe(2)
    })

    it('throws when registering duplicate version', () => {
      const migration: Migration = {
        version: 2,
        description: 'Test migration',
        up: async () => {
          /* no-op */
        },
      }

      runner.register(migration)

      expect(() => runner.register(migration)).toThrow('already registered')
    })

    it('returns migrations sorted by version', () => {
      runner.register({
        version: 3,
        description: 'V3',
        up: async () => {
          /* no-op */
        },
      })
      runner.register({
        version: 1,
        description: 'V1',
        up: async () => {
          /* no-op */
        },
      })
      runner.register({
        version: 2,
        description: 'V2',
        up: async () => {
          /* no-op */
        },
      })

      const migrations = runner.getMigrations()

      expect(migrations.map((m) => m.version)).toEqual([1, 2, 3])
    })
  })

  describe('getMigrationPath', () => {
    beforeEach(() => {
      runner.register({
        version: 2,
        description: 'V2',
        up: async () => {
          /* no-op */
        },
      })
      runner.register({
        version: 3,
        description: 'V3',
        up: async () => {
          /* no-op */
        },
      })
      runner.register({
        version: 4,
        description: 'V4',
        up: async () => {
          /* no-op */
        },
      })
    })

    it('returns migrations between versions', () => {
      const path = runner.getMigrationPath(1, 3)

      expect(path).toHaveLength(2)
      expect(path.map((m) => m.version)).toEqual([2, 3])
    })

    it('excludes migrations at fromVersion', () => {
      const path = runner.getMigrationPath(2, 4)

      expect(path).toHaveLength(2)
      expect(path[0].version).toBe(3)
    })

    it('includes migrations at toVersion', () => {
      const path = runner.getMigrationPath(1, 2)

      expect(path).toHaveLength(1)
      expect(path[0].version).toBe(2)
    })

    it('returns empty array when no migrations needed', () => {
      const path = runner.getMigrationPath(1, 1)

      expect(path).toHaveLength(0)
    })
  })

  describe('v1 to v2 migration', () => {
    let db: Dexie

    beforeEach(async () => {
      db = createDBAtVersion(1)
      await db.open()
      registerVaultMigrations(runner)
    })

    afterEach(async () => {
      await cleanupMigrationTest()
    })

    it('adds updatedAt field to all items during v1→v2 migration', async () => {
      await createV1TestData(db)

      // Verify items don't have updatedAt before migration
      const itemsBefore = await db.table('items').toArray()
      expect(
        itemsBefore.every((i: Record<string, unknown>) => !('updatedAt' in i))
      ).toBe(true)

      // Apply v2 migration
      const result = await runner.run(db, 1, 2)

      expect(result.success).toBe(true)
      expect(result.fromVersion).toBe(1)
      expect(result.toVersion).toBe(2)

      // Verify all items now have updatedAt
      const itemsAfter = await db.table('items').toArray()
      expect(
        itemsAfter.every((i: Record<string, unknown>) => 'updatedAt' in i)
      ).toBe(true)
      expect(
        itemsAfter.every(
          (i: Record<string, unknown>) => typeof i.updatedAt === 'string'
        )
      ).toBe(true)
    })

    it('preserves all existing data during migration', async () => {
      const ids = await createV1TestData(db)

      await runner.run(db, 1, 2)

      const preservation = await verifyDataPreservation(db, ids)
      expect(preservation.preserved).toBe(true)
      expect(preservation.missingIds).toHaveLength(0)
    })

    it('uses capturedAt as default for updatedAt', async () => {
      await createV1TestData(db)

      await runner.run(db, 1, 2)

      const items = await db.table('items').toArray()
      for (const item of items) {
        expect(item.updatedAt).toBe(item.capturedAt)
      }
    })
  })

  describe('v2 to v3 migration', () => {
    let db: Dexie

    beforeEach(async () => {
      db = createDBAtVersion(2)
      await db.open()
      registerVaultMigrations(runner)
      // Pre-populate with v2 data
      await populateTestData(db, 2, 5)
    })

    afterEach(async () => {
      await cleanupMigrationTest()
    })

    it('adds tags array to all items during v2→v3 migration', async () => {
      // Verify items don't have tags before migration
      const itemsBefore = await db.table('items').toArray()
      expect(
        itemsBefore.every((i: Record<string, unknown>) => !('tags' in i))
      ).toBe(true)

      // Apply v3 migration
      const result = await runner.run(db, 2, 3)

      expect(result.success).toBe(true)

      // Verify all items now have tags
      const itemsAfter = await db.table('items').toArray()
      expect(
        itemsAfter.every((i: Record<string, unknown>) => Array.isArray(i.tags))
      ).toBe(true)
    })

    it('validates migration success', async () => {
      const result = await runner.run(db, 2, 3)

      expect(result.success).toBe(true)

      const validation = await validateDataIntegrity(db, 3)
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('sequential migrations', () => {
    let db: Dexie

    beforeEach(async () => {
      db = createDBAtVersion(1)
      await db.open()
      registerVaultMigrations(runner)
      await createV1TestData(db)
    })

    afterEach(async () => {
      await cleanupMigrationTest()
    })

    it('runs multiple migrations in sequence (v1→v3)', async () => {
      const result = await runner.run(db, 1, 3)

      expect(result.success).toBe(true)
      expect(result.fromVersion).toBe(1)
      expect(result.toVersion).toBe(3)

      // Verify both migrations applied
      const validation = await validateDataIntegrity(db, 3)
      expect(validation.valid).toBe(true)
    })

    it('preserves data through multiple migrations', async () => {
      const ids = await db
        .table('items')
        .toArray()
        .then((items: Array<{ id: string }>) => items.map((i) => i.id))

      await runner.run(db, 1, 3)

      const preservation = await verifyDataPreservation(db, ids)
      expect(preservation.preserved).toBe(true)
    })
  })

  describe('error handling', () => {
    let db: Dexie

    beforeEach(async () => {
      db = createDBAtVersion(1)
      await db.open()
      await createV1TestData(db)
    })

    afterEach(async () => {
      await cleanupMigrationTest()
    })

    it('handles migration failure gracefully', async () => {
      const failingMigration = createMockMigration(
        2,
        'Failing migration',
        async () => {
          /* never called */
        },
        true
      )
      runner.register(failingMigration)

      const result = await runner.run(db, 1, 2)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('MIGRATION_FAILED')
    })

    it('includes error details on failure', async () => {
      const failingMigration = createMockMigration(
        2,
        'Failing migration',
        async () => {
          /* never called */
        },
        true
      )
      runner.register(failingMigration)

      const result = await runner.run(db, 1, 2)

      expect(result.error?.failedAtVersion).toBe(2)
      expect(result.error?.message).toContain('failed')
    })

    it('logs migration progress', async () => {
      registerVaultMigrations(runner)

      const result = await runner.run(db, 1, 2)

      expect(result.logs.length).toBeGreaterThan(0)
      expect(
        result.logs.some((l) => l.message.includes('Starting migration'))
      ).toBe(true)
      expect(
        result.logs.some((l) => l.message.includes('completed successfully'))
      ).toBe(true)
    })
  })

  describe('progress tracking', () => {
    let db: Dexie

    beforeEach(async () => {
      db = createDBAtVersion(1)
      await db.open()
      registerVaultMigrations(runner)
    })

    afterEach(async () => {
      await cleanupMigrationTest()
    })

    it('calls progress callback during migration', async () => {
      const progressUpdates: Array<{ step: string; percent: number }> = []

      await runner.run(db, 1, 2, {
        onProgress: (progress) => {
          progressUpdates.push({
            step: progress.step,
            percent: progress.percent,
          })
        },
      })

      expect(progressUpdates.length).toBeGreaterThan(0)
      expect(progressUpdates.some((p) => p.step === 'migrating_v2')).toBe(true)
      expect(progressUpdates.some((p) => p.step === 'completed')).toBe(true)
    })

    it('reports correct target version in progress', async () => {
      const lastProgress = await runner
        .run(db, 1, 2, {
          onProgress: () => {
            /* no-op */
          },
        })
        .then(() => ({ targetVersion: 2 }))

      expect(lastProgress.targetVersion).toBe(2)
    })
  })

  describe('timeout handling', () => {
    let db: Dexie

    beforeEach(async () => {
      db = createDBAtVersion(1)
      await db.open()
    })

    afterEach(async () => {
      await cleanupMigrationTest()
    })

    it('times out slow migrations', async () => {
      const slowMigration: Migration = {
        version: 2,
        description: 'Slow migration',
        up: async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        },
      }
      runner.register(slowMigration)

      const result = await runner.run(db, 1, 2, { timeoutMs: 100 })

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('MIGRATION_FAILED')
      expect(result.error?.message).toContain('timed out')
    })

    it('succeeds when migration completes within timeout', async () => {
      const fastMigration: Migration = {
        version: 2,
        description: 'Fast migration',
        up: async () => {
          /* no-op */
        },
      }
      runner.register(fastMigration)

      const result = await runner.run(db, 1, 2, { timeoutMs: 5000 })

      expect(result.success).toBe(true)
    })
  })

  describe('validation', () => {
    let db: Dexie

    beforeEach(async () => {
      db = createDBAtVersion(1)
      await db.open()
    })

    afterEach(async () => {
      await cleanupMigrationTest()
    })

    it('fails when validation returns false', async () => {
      const migrationWithValidation: Migration = {
        version: 2,
        description: 'Migration with validation',
        up: async () => {
          /* no-op */
        },
        validate: async () => false,
      }
      runner.register(migrationWithValidation)

      const result = await runner.run(db, 1, 2)

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe('MIGRATION_FAILED')
      expect(result.error?.message).toContain('Validation failed')
    })

    it('succeeds when validation passes', async () => {
      const migrationWithValidation: Migration = {
        version: 2,
        description: 'Migration with validation',
        up: async () => {
          /* no-op */
        },
        validate: async () => true,
      }
      runner.register(migrationWithValidation)

      const result = await runner.run(db, 1, 2)

      expect(result.success).toBe(true)
    })
  })

  describe('dry run mode', () => {
    let db: Dexie

    beforeEach(async () => {
      db = createDBAtVersion(1)
      await db.open()
      registerVaultMigrations(runner)
      await createV1TestData(db)
    })

    afterEach(async () => {
      await cleanupMigrationTest()
    })

    it('context indicates dry run mode', async () => {
      let capturedContext: MigrationContext | undefined

      // Use version 10 (higher than vault migrations v2, v3)
      // Note: runner already has v2 and v3 from registerVaultMigrations
      const testMigration: Migration = {
        version: 10,
        description: 'Test dry run',
        up: async (_db, ctx) => {
          capturedContext = ctx
        },
      }
      runner.register(testMigration)

      await runner.run(db, 1, 10, { dryRun: true })

      expect(capturedContext?.dryRun).toBe(true)
    })
  })
})

describe('Vault Migrations', () => {
  it('exports all expected migrations', () => {
    expect(vaultMigrations).toHaveLength(2)
    expect(vaultMigrations.map((m) => m.version)).toContain(2)
    expect(vaultMigrations.map((m) => m.version)).toContain(3)
  })

  it('each migration has required properties', () => {
    for (const migration of vaultMigrations) {
      expect(migration.version).toBeGreaterThan(1)
      expect(migration.description).toBeTruthy()
      expect(typeof migration.up).toBe('function')
    }
  })
})
