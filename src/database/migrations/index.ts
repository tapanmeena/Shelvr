import { runMigrationV1 } from "@/src/database/migrations/v1";
import { dbLog } from "@/src/utils/logger";
import { SQLiteDatabase } from "expo-sqlite";

export interface MigrationInfo {
  version: number;
  name: string;
  migrate: (db: SQLiteDatabase) => Promise<void>;
}

const migrations: MigrationInfo[] = [
  {
    version: 1,
    name: "initial_schema",
    migrate: runMigrationV1,
  },
];

const CREATE_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at INTEGER NOT NULL
  );
`;

// Runn all pending migrations
export const runMigrations = async (db: SQLiteDatabase): Promise<void> => {
  // Create migrations tracking table
  await db.execAsync(CREATE_MIGRATIONS_TABLE);

  // Get current version
  const result = await db.getFirstAsync<{ version: number }>("SELECT MAX(version) as version FROM schema_migrations");
  const currentVersion = result?.version ?? 0; // 0 means, initial table creation

  dbLog.info(`Curretn schema version: ${currentVersion}`);

  // Run pending migrations
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      dbLog.info(`Running migration v${migration.version}: ${migration.name}`);

      try {
        await migration.migrate(db);

        // Record the migration
        await db.runAsync("INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)", [
          migration.version,
          migration.name,
          Date.now(),
        ]);

        dbLog.info(`Migration v${migration.version} completed successfully`);
      } catch (error) {
        dbLog.error(`Migration v${migration.version} failed:`, error);
        throw error;
      }
    }
  }

  dbLog.info("All migrations completed");
};

export const getCurrentSchemaVersion = (): number => {
  return migrations.length > 0 ? migrations[migrations.length - 1].version : 0;
};
