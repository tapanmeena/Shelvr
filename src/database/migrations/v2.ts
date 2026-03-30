import { dbLog } from "@/src/utils/logger";
import { SQLiteDatabase } from "expo-sqlite";

const columnExists = async (db: SQLiteDatabase, table: string, column: string): Promise<boolean> => {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  return columns.some((col) => col.name === column);
};

export const runMigrationV2 = async (db: SQLiteDatabase): Promise<void> => {
  if (!(await columnExists(db, "books", "series"))) {
    await db.execAsync("ALTER TABLE books ADD COLUMN series TEXT;");
  }
  if (!(await columnExists(db, "books", "series_index"))) {
    await db.execAsync("ALTER TABLE books ADD COLUMN series_index REAL;");
  }

  dbLog.info("Migration v2: Added series and series_index columns to books");
};
