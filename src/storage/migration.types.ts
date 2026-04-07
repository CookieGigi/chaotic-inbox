import type { Dexie } from 'dexie'

/**
 * Context provided to each migration function containing
 * utilities and information about the migration.
 */
export interface MigrationContext {
  /** The version we're migrating from */
  fromVersion: number
  /** The version we're migrating to */
  toVersion: number
  /** Current timestamp for the migration */
  timestamp: string
  /** Whether this is a dry-run (validation only) */
  dryRun: boolean
  /** Log messages during migration */
  log: (message: string, level?: 'info' | 'warn' | 'error') => void
}

/**
 * Function signature for a database migration.
 * Receives the Dexie instance and migration context.
 */
export type MigrationFunction = (
  db: Dexie,
  context: MigrationContext
) => Promise<void>

/**
 * Result of a migration operation.
 */
export interface MigrationResult {
  /** Whether the migration succeeded */
  success: boolean
  /** The version migrated from */
  fromVersion: number
  /** The version migrated to */
  toVersion: number
  /** Timestamp when migration completed */
  completedAt: string
  /** Number of records affected */
  recordsAffected?: number
  /** Error details if migration failed */
  error?: MigrationError
  /** Log messages from the migration */
  logs: MigrationLogEntry[]
}

/**
 * Error details for failed migrations.
 */
export interface MigrationError {
  /** Error message */
  message: string
  /** Error code for programmatic handling */
  code: MigrationErrorCode
  /** Original error if available */
  originalError?: Error
  /** The version where error occurred */
  failedAtVersion: number
}

/**
 * Error codes for migration failures.
 */
export type MigrationErrorCode =
  | 'SCHEMA_INCOMPATIBLE'
  | 'DATA_CORRUPTION'
  | 'MIGRATION_FAILED'
  | 'ROLLBACK_FAILED'
  | 'VALIDATION_FAILED'
  | 'TIMEOUT'
  | 'UNKNOWN'

/**
 * Log entry from a migration.
 */
export interface MigrationLogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
  version?: number
}

/**
 * Configuration for the migration runner.
 */
export interface MigrationConfig {
  /** Enable dry-run mode for testing */
  dryRun?: boolean
  /** Timeout for each migration in milliseconds */
  timeoutMs?: number
  /** Callback for progress updates */
  onProgress?: (progress: MigrationProgress) => void
  /** Whether to create automatic backups */
  autoBackup?: boolean
}

/**
 * Progress information during migration.
 */
export interface MigrationProgress {
  /** Current step (e.g., 'backing_up', 'migrating_v2') */
  step: string
  /** Progress percentage (0-100) */
  percent: number
  /** Current version being processed */
  currentVersion?: number
  /** Target version */
  targetVersion: number
  /** Message describing current operation */
  message: string
}

/**
 * A single migration definition.
 */
export interface Migration {
  /** The version this migration upgrades to */
  version: number
  /** Human-readable description of the migration */
  description: string
  /** The migration function to execute */
  up: MigrationFunction
  /** Optional validation function to verify migration success */
  validate?: (db: Dexie) => Promise<boolean>
}

/**
 * Registry of all migrations, keyed by version number.
 */
export type MigrationRegistry = Map<number, Migration>

/**
 * Metadata stored about migrations in the database.
 */
export interface MigrationMetadata {
  /** Current schema version */
  currentVersion: number
  /** History of applied migrations */
  history: MigrationHistoryEntry[]
  /** When the database was first created */
  createdAt: string
  /** Last migration timestamp */
  lastMigrationAt?: string
}

/**
 * Entry in the migration history.
 */
export interface MigrationHistoryEntry {
  version: number
  appliedAt: string
  description: string
  success: boolean
  recordsAffected?: number
}

/**
 * Backup data structure for rollback capability.
 */
export interface MigrationBackup {
  /** Version the backup was created from */
  version: number
  /** Timestamp when backup was created */
  createdAt: string
  /** Serialized data for rollback */
  data: string
  /** Tables included in backup */
  tables: string[]
}
