export {
  db,
  VaultDB,
  CURRENT_SCHEMA_VERSION,
  getCurrentDBVersion,
  isDBVersionCurrent,
} from './local_db'
export {
  migrationRunner,
  registerVaultMigrations,
  createDexieUpgrade,
  vaultMigrations,
  MigrationRunner,
} from './migration'
export type {
  Migration,
  MigrationConfig,
  MigrationContext,
  MigrationResult,
  MigrationProgress,
  MigrationError,
  MigrationLogEntry,
} from './migration.types'
