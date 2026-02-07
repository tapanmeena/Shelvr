import { Book, ReadingProgress } from "@/src/types";
import type { SQLiteDatabase } from "expo-sqlite";

// Books
export const getAllBooks = async (db: SQLiteDatabase): Promise<Book[]> => {
  const rows = await db.getAllAsync<BookRow>("SELECT * FROM books ORDER BY updated_at DESC");
  return rows.map(rowToBook);
};

export const getBookById = async (db: SQLiteDatabase, id: string): Promise<Book | null> => {
  const row = await db.getFirstAsync<BookRow>("SELECT * FROM books WHERE id = ?", [id]);
  return row ? rowToBook(row) : null;
};

export const searchBooks = async (db: SQLiteDatabase, query: string): Promise<Book[]> => {
  const searchPattern = `%${query}%`;
  const rows = await db.getAllAsync<BookRow>(
    `SELECT * FROM books
    WHERE title LIKE ? OR authors LIKE ?
    ORDER BY updated_at DESC`,
    [searchPattern, searchPattern],
  );
  return rows.map(rowToBook);
};

export const insertBook = async (db: SQLiteDatabase, book: Book): Promise<void> => {
  await db.runAsync(
    `INSERT INTO books (
      id, title, authors, description, cover_path, file_path, source,
      komga_book_id, komga_server_id, file_size, page_count, published_date,
      language, series, series_index, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      book.id,
      book.title,
      book.authors ? JSON.stringify(book.authors) : null,
      book.description ?? null,
      book.coverPath ?? null,
      book.filePath,
      book.source,
      book.komgaBookId ?? null,
      book.komgaServerId ?? null,
      book.fileSize ?? null,
      book.pageCount ?? null,
      book.publishedDate ?? null,
      book.language ?? null,
      book.series ?? null,
      book.seriesIndex ?? null,
      book.createdAt,
      book.updatedAt,
    ],
  );
};

export const updateBook = async (db: SQLiteDatabase, id: string, updates: Partial<Book>): Promise<void> => {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    values.push(updates.title);
  }
  if (updates.authors !== undefined) {
    fields.push("authors = ?");
    values.push(JSON.stringify(updates.authors));
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description ?? null);
  }
  if (updates.coverPath !== undefined) {
    fields.push("cover_path = ?");
    values.push(updates.coverPath ?? null);
  }
  if (updates.language !== undefined) {
    fields.push("language = ?");
    values.push(updates.language ?? null);
  }
  if (updates.publishedDate !== undefined) {
    fields.push("published_date = ?");
    values.push(updates.publishedDate ?? null);
  }
  if (updates.series !== undefined) {
    fields.push("series = ?");
    values.push(updates.series ?? null);
  }
  if (updates.seriesIndex !== undefined) {
    fields.push("series_index = ?");
    values.push(updates.seriesIndex ?? null);
  }

  fields.push("updated_at = ?");
  values.push(Date.now());
  values.push(id);

  if (fields.length > 1) {
    await db.runAsync(`UPDATE books SET ${fields.join(", ")} WHERE id = ?`, values);
  }
};

export const deleteBook = async (db: SQLiteDatabase, id: string): Promise<void> => {
  await db.runAsync("DELETE FROM books WHERE id = ?", [id]);
};

export const getReadingProgress = async (db: SQLiteDatabase, bookId: string): Promise<ReadingProgress | null> => {
  const row = await db.getFirstAsync<ReadingProgressRow>("SELECT * FROM reading_progress WHERE book_id = ?", [bookId]);
  return row ? rowToReadingProgress(row) : null;
};

export const upsertReadingProgress = async (db: SQLiteDatabase, progress: Omit<ReadingProgress, "id">): Promise<void> => {
  await db.runAsync(
    `INSERT INTO reading_progress (
      book_id, cfi, percentage, chapter, chapter_title, last_read_at
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(book_id) DO UPDATE SET
      cfi = excluded.cfi,
      percentage = excluded.percentage,
      chapter = excluded.chapter,
      chapter_title = excluded.chapter_title,
      last_read_at = excluded.last_read_at`,
    [progress.bookId, progress.cfi ?? null, progress.percentage, progress.chapter ?? null, progress.chapterTitle ?? null, progress.lastReadAt],
  );
};

// Row Types & Mappers
interface BookRow {
  id: string;
  title: string;
  authors: string | null;
  description: string | null;
  cover_path: string | null;
  file_path: string;
  source: "local" | "komga";
  komga_book_id: string | null;
  komga_server_id: string | null;
  file_size: number | null;
  page_count: number | null;
  published_date: string | null;
  language: string | null;
  series: string | null;
  series_index: number | null;
  created_at: number;
  updated_at: number;
}

interface ReadingProgressRow {
  id: number;
  book_id: string;
  cfi: string | null;
  percentage: number;
  chapter: string | null;
  chapter_title: string | null;
  last_read_at: number;
}

const rowToBook = (row: BookRow): Book => {
  return {
    id: row.id,
    title: row.title,
    authors: row.authors ? JSON.parse(row.authors) : undefined,
    description: row.description ?? undefined,
    coverPath: row.cover_path ?? undefined,
    filePath: row.file_path,
    source: row.source,
    komgaBookId: row.komga_book_id ?? undefined,
    komgaServerId: row.komga_server_id ?? undefined,
    fileSize: row.file_size ?? undefined,
    pageCount: row.page_count ?? undefined,
    publishedDate: row.published_date ?? undefined,
    language: row.language ?? undefined,
    series: row.series ?? undefined,
    seriesIndex: row.series_index ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const rowToReadingProgress = (row: ReadingProgressRow): ReadingProgress => {
  return {
    id: row.id,
    bookId: row.book_id,
    cfi: row.cfi ?? undefined,
    percentage: row.percentage,
    chapter: row.chapter ?? undefined,
    chapterTitle: row.chapter_title ?? undefined,
    lastReadAt: row.last_read_at,
  };
};
