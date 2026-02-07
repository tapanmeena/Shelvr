import { dbLog } from "@/src/utils/logger";
import { SQLiteDatabase } from "expo-sqlite";

export const runMigrationV2 = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync("ALTER TABLE books ADD COLUMN series TEXT;");
  await db.execAsync("ALTER TABLE books ADD COLUMN series_index REAL;");

  dbLog.info("Migration v2: Added series and series_index columns to books");
};
