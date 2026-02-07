import * as repository from "@/src/database/repository";
import type { ReadingProgress } from "@/src/types";
import { readerLog } from "@/src/utils/logger";
import { SQLiteDatabase } from "expo-sqlite";

// Save reading progress to db
export const saveProgress = async (
  db: SQLiteDatabase,
  bookId: string,
  cfi: string,
  percentage: number,
  chapter?: string,
  chapterTitle?: string,
): Promise<void> => {
  const progress: Omit<ReadingProgress, "id"> = {
    bookId,
    cfi,
    percentage,
    chapter,
    chapterTitle,
    lastReadAt: Date.now(),
  };

  await repository.upsertReadingProgress(db, progress);
  readerLog.debug(
    `Saved progress for book ${bookId}: ${Math.round(percentage * 100)}%`,
  );
};

// Load reading progress from db
export const loadProgress = async (
  db: SQLiteDatabase,
  bookId: string,
): Promise<ReadingProgress | null> => {
  const progress = await repository.getReadingProgress(db, bookId);
  if (progress) {
    readerLog.debug(
      `Loaded progress for book ${bookId}: ${Math.round(progress.percentage * 100)}%`,
    );
  }
  return progress;
};
