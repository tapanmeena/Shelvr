import { CREATE_BOOKS_TABLE, CREATE_INDEXES, CREATE_READING_PROGRESS_TABLE } from "@/src/database/schema";
import { dbLog } from "@/src/utils/logger";
import { SQLiteDatabase } from "expo-sqlite";

export const runMigrationV1 = async (db: SQLiteDatabase): Promise<void> => {
  // Enable foreign keys
  await db.execAsync("PRAGMA foreign_keys = ON;");

  // Create tables
  await db.execAsync(CREATE_BOOKS_TABLE);
  await db.execAsync(CREATE_READING_PROGRESS_TABLE);

  // CREATE indexes
  await db.execAsync(CREATE_INDEXES);

  // log
  dbLog.info("Migration v1: Created tables: books, reading_progress");
};
