export const SCHEMA_VERSION = 1;

export const CREATE_BOOKS_TABLE = `
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    authors TEXT,
    description TEXT,
    cover_path TEXT,
    file_path TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('local', 'komga')),
    komga_book_id TEXT,
    komga_server_id TEXT,
    file_size INTEGER,
    page_count INTEGER,
    published_date TEXT,
    language TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;

export const CREATE_READING_PROGRESS_TABLE = `
  CREATE TABLE IF NOT EXISTS reading_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id TEXT NOT NULL UNIQUE,
    cfi TEXT,
    percentage REAL DEFAULT 0.0,
    chapter TEXT,
    chapter_title TEXT,
    last_read_at INTEGER NOT NULL,
    FOREIGN KEY (book_id) REFERENCES books(id) on DELETE CASCADE
  );
`;

// INDEXES
export const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_books_source ON books(source);
  CREATE INDEX IF NOT EXISTS idx_books_komga_server ON books(komga_server_id);
  CREATE INDEX IF NOT EXISTS idx_books_title ON books(title COLLATE NOCASE);
  CREATE INDEX IF NOT EXISTS idx_books_updated ON books(updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_reading_progress_book ON reading_progress(book_id);
  CREATE INDEX IF NOT EXISTS idx_reading_progress_last_read ON reading_progress(last_read_at DESC);
`;

export const ALL_TABLES = [CREATE_BOOKS_TABLE, CREATE_READING_PROGRESS_TABLE, CREATE_INDEXES];
