import { dbLog } from "@/src/utils/logger";
import { SQLiteDatabase } from "expo-sqlite";

export const runMigrationV3 = async (db: SQLiteDatabase): Promise<void> => {
  // Shelves table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS shelves (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_smart INTEGER NOT NULL DEFAULT 0,
      smart_filter TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // Book-shelf junction table (many-to-many)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS book_shelves (
      book_id TEXT NOT NULL,
      shelf_id TEXT NOT NULL,
      added_at INTEGER NOT NULL,
      PRIMARY KEY (book_id, shelf_id),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (shelf_id) REFERENCES shelves(id) ON DELETE CASCADE
    );
  `);

  // Indexes
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_book_shelves_shelf ON book_shelves(shelf_id);
  `);
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_book_shelves_book ON book_shelves(book_id);
  `);
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_shelves_sort ON shelves(sort_order);
  `);

  dbLog.info("Migration v3: Created shelves and book_shelves tables");
};
