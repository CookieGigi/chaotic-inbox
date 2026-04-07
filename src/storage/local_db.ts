import { Dexie, type EntityTable } from 'dexie'
import type { RawItem } from '@/models/rawItem'
import { migrationRunner, registerVaultMigrations } from './migration'

/**
 * Current database schema version.
 * Increment this when adding schema changes that require migration.
 *
 * Version history:
 * - v1: Initial schema with items table (id, capturedAt, type)
 * - v2: Add updatedAt field to all items
 * - v3: Add tags support with multi-entry index
 */
export const CURRENT_SCHEMA_VERSION = 1

export class VaultDB extends Dexie {
  items!: EntityTable<RawItem, 'id'>

  constructor() {
    super('vault')

    // Register all vault migrations with the runner
    registerVaultMigrations(migrationRunner)

    // Version 1: Initial schema
    this.version(1).stores({
      items: 'id, capturedAt, type',
    })

    // Version 2: Add updatedAt field
    // Uncomment when ready to deploy v2:
    // this.version(2)
    //   .stores({
    //     items: 'id, capturedAt, type, updatedAt',
    //   })
    //   .upgrade(createDexieUpgrade(migrationRunner, 1, 2))

    // Version 3: Add tags support
    // Uncomment when ready to deploy v3:
    // this.version(3)
    //   .stores({
    //     items: 'id, capturedAt, type, updatedAt, *tags',
    //   })
    //   .upgrade(createDexieUpgrade(migrationRunner, 2, 3))
  }
}

/**
 * Singleton database instance.
 * Use this for all database operations.
 */
export const db = new VaultDB()

/**
 * Get the current database schema version.
 * Useful for debugging and migration status checks.
 */
export async function getCurrentDBVersion(): Promise<number> {
  return await db.verno
}

/**
 * Check if the database is at the expected schema version.
 */
export async function isDBVersionCurrent(): Promise<boolean> {
  return (await getCurrentDBVersion()) === CURRENT_SCHEMA_VERSION
}
