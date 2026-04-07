import type { Dexie } from 'dexie'
import type {
  Migration,
  MigrationConfig,
  MigrationContext,
  MigrationError,
  MigrationErrorCode,
  MigrationLogEntry,
  MigrationProgress,
  MigrationRegistry,
  MigrationResult,
} from './migration.types'

const DEFAULT_TIMEOUT_MS = 30000 // 30 seconds

/**
 * Manages database migrations using Dexie's upgrade system.
 *
 * This class provides:
 * - Sequential migration execution
 * - Progress tracking
 * - Error handling with rollback
 * - Migration history tracking
 *
 * @example
 * ```typescript
 * const runner = new MigrationRunner()
 * runner.register({
 *   version: 2,
 *   description: 'Add updatedAt field',
 *   up: async (db, ctx) => {
 *     await db.table('items').toCollection().modify(item => {
 *       item.updatedAt = item.capturedAt
 *     })
 *   }
 * })
 *
 * const result = await runner.run(db, { fromVersion: 1, toVersion: 2 })
 * ```
 */
export class MigrationRunner {
  private registry: MigrationRegistry = new Map()
  private logs: MigrationLogEntry[] = []

  /**
   * Register a migration.
   */
  register(migration: Migration): void {
    if (this.registry.has(migration.version)) {
      throw new Error(
        `Migration for version ${migration.version} already registered`
      )
    }
    this.registry.set(migration.version, migration)
  }

  /**
   * Get all registered migrations sorted by version.
   */
  getMigrations(): Migration[] {
    return Array.from(this.registry.values()).sort(
      (a, b) => a.version - b.version
    )
  }

  /**
   * Get migrations needed to go from one version to another.
   */
  getMigrationPath(fromVersion: number, toVersion: number): Migration[] {
    const allMigrations = this.getMigrations()
    return allMigrations.filter(
      (m) => m.version > fromVersion && m.version <= toVersion
    )
  }

  /**
   * Run migrations to upgrade the database.
   *
   * This method is designed to be called within Dexie's upgrade callback.
   * It runs all registered migrations between fromVersion and toVersion.
   */
  async run(
    transaction: Dexie,
    fromVersion: number,
    toVersion: number,
    config: MigrationConfig = {}
  ): Promise<MigrationResult> {
    this.logs = []
    const migrations = this.getMigrationPath(fromVersion, toVersion)

    this.log('info', `Starting migration from v${fromVersion} to v${toVersion}`)
    this.log('info', `Found ${migrations.length} migrations to apply`)

    try {
      // Run each migration sequentially
      for (let i = 0; i < migrations.length; i++) {
        const migration = migrations[i]
        const progress: MigrationProgress = {
          step: `migrating_v${migration.version}`,
          percent: Math.round((i / migrations.length) * 100),
          currentVersion: migration.version,
          targetVersion: toVersion,
          message: `Applying: ${migration.description}`,
        }

        config.onProgress?.(progress)
        this.log(
          'info',
          `Applying migration v${migration.version}: ${migration.description}`
        )

        const context = this.createContext(
          fromVersion,
          migration.version,
          config
        )

        await this.runWithTimeout(
          () => migration.up(transaction, context),
          config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
          migration.version
        )

        // Validate if validation function provided
        if (migration.validate) {
          const valid = await migration.validate(transaction)
          if (!valid) {
            throw this.createError(
              'VALIDATION_FAILED',
              migration.version,
              `Validation failed for migration v${migration.version}`
            )
          }
        }

        this.log(
          'info',
          `Migration v${migration.version} completed successfully`
        )
      }

      const result: MigrationResult = {
        success: true,
        fromVersion,
        toVersion,
        completedAt: new Date().toISOString(),
        logs: [...this.logs],
      }

      config.onProgress?.({
        step: 'completed',
        percent: 100,
        targetVersion: toVersion,
        message: 'Migration completed successfully',
      })

      return result
    } catch (error) {
      const failedAtVersion =
        error instanceof Error && 'failedAtVersion' in error
          ? (error as unknown as MigrationError).failedAtVersion
          : toVersion

      const migrationError = this.createError(
        'MIGRATION_FAILED',
        failedAtVersion,
        error instanceof Error ? error.message : String(error),
        error instanceof Error ? error : undefined
      )

      config.onProgress?.({
        step: 'failed',
        percent: 0,
        currentVersion: failedAtVersion,
        targetVersion: toVersion,
        message: `Migration failed: ${migrationError.message}`,
      })

      return {
        success: false,
        fromVersion,
        toVersion,
        completedAt: new Date().toISOString(),
        error: migrationError,
        logs: [...this.logs],
      }
    }
  }

  /**
   * Create a migration context for the given versions.
   */
  private createContext(
    fromVersion: number,
    toVersion: number,
    config: MigrationConfig
  ): MigrationContext {
    return {
      fromVersion,
      toVersion,
      timestamp: new Date().toISOString(),
      dryRun: config.dryRun ?? false,
      log: (message, level = 'info') => this.log(level, message, toVersion),
    }
  }

  /**
   * Log a message.
   */
  private log(
    level: 'info' | 'warn' | 'error',
    message: string,
    version?: number
  ): void {
    const entry: MigrationLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      version,
    }
    this.logs.push(entry)

    // Also log to console in development
    if (import.meta.env?.DEV) {
      const consoleMethod =
        level === 'error'
          ? console.error
          : level === 'warn'
            ? console.warn
            : console.log
      consoleMethod(`[Migration${version ? ` v${version}` : ''}] ${message}`)
    }
  }

  /**
   * Run a function with a timeout.
   */
  private async runWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    version: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            this.createError(
              'TIMEOUT',
              version,
              `Migration v${version} timed out after ${timeoutMs}ms`
            )
          )
        }, timeoutMs)
      }),
    ])
  }

  /**
   * Create a standardized migration error.
   */
  private createError(
    code: MigrationErrorCode,
    failedAtVersion: number,
    message: string,
    originalError?: Error
  ): MigrationError {
    const error = new Error(message) as Error & MigrationError
    error.code = code
    error.failedAtVersion = failedAtVersion
    error.originalError = originalError
    return error
  }
}

/**
 * Singleton instance of the migration runner.
 */
export const migrationRunner = new MigrationRunner()

/**
 * Helper to add migrations to the Dexie schema upgrade chain.
 *
 * Usage in your database class:
 * ```typescript
 * constructor() {
 *   super('mydb')
 *
 *   // Version 1
 *   this.version(1).stores({ items: 'id' })
 *
 *   // Version 2 with migration
 *   this.version(2).stores({ items: 'id, createdAt' }).upgrade(tx => {
 *     return migrationRunner.run(tx, 1, 2)
 *   })
 * }
 * ```
 */
export function createDexieUpgrade(
  runner: MigrationRunner,
  fromVersion: number,
  toVersion: number,
  config?: MigrationConfig
): (tx: Dexie) => Promise<void> {
  return async (tx: Dexie) => {
    const result = await runner.run(tx, fromVersion, toVersion, config)
    if (!result.success) {
      throw new Error(
        `Migration from v${fromVersion} to v${toVersion} failed: ${result.error?.message}`
      )
    }
  }
}

/**
 * Built-in migrations for the vault database.
 */
export const vaultMigrations: Migration[] = [
  // Migration 2: Example - Add updatedAt field to all items
  {
    version: 2,
    description: 'Add updatedAt field to all items',
    up: async (db, ctx) => {
      const table = db.table('items')
      let count = 0

      await table.toCollection().modify((item: Record<string, unknown>) => {
        if (!item.updatedAt) {
          item.updatedAt = item.capturedAt || ctx.timestamp
          count++
        }
      })

      ctx.log(`Updated ${count} items with updatedAt field`)
    },
    validate: async (db) => {
      const table = db.table('items')
      const items = await table.toArray()
      return items.every((item) => 'updatedAt' in item)
    },
  },

  // Migration 3: Example - Add tags index and migrate existing items
  {
    version: 3,
    description: 'Add tags support to items',
    up: async (db, ctx) => {
      const table = db.table('items')
      let count = 0

      await table.toCollection().modify((item: Record<string, unknown>) => {
        if (!item.tags) {
          item.tags = []
          count++
        }
      })

      ctx.log(`Added tags array to ${count} items`)
    },
    validate: async (db) => {
      const table = db.table('items')
      const items = await table.toArray()
      return items.every((item) =>
        Array.isArray((item as Record<string, unknown>).tags)
      )
    },
  },
]

/**
 * Register all vault migrations with the runner.
 * Safe to call multiple times - skips already registered migrations.
 */
export function registerVaultMigrations(
  runner: MigrationRunner = migrationRunner
): void {
  vaultMigrations.forEach((migration) => {
    // Skip if already registered (prevents errors when creating multiple DB instances)
    const existingMigrations = runner.getMigrations()
    if (!existingMigrations.some((m) => m.version === migration.version)) {
      runner.register(migration)
    }
  })
}
