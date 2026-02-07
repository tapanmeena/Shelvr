import * as repository from "@/src/database/repository";
import { useDatabase, useDatabaseStatus } from "@/src/database/useDatabase";
import { useLibraryStore } from "@/src/stores/libraryStore";
import { BookWithProgress } from "@/src/types";
import { libraryLog } from "@/src/utils/logger";
import { useCallback, useEffect, useState } from "react";

interface UseLibraryReturn {
  books: BookWithProgress[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const useLibrary = (): UseLibraryReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const db = useDatabase();
  const { isReady } = useDatabaseStatus();
  const setBooks = useLibraryStore((state) => state.setBooks);
  const setProgress = useLibraryStore((state) => state.setProgress);
  const getBooksWithProgress = useLibraryStore((state) => state.getBooksWithProgress);

  const loadBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isReady || !db) {
        return;
      }

      // Load books fromd atabase
      const dbBooks = await repository.getAllBooks(db);
      setBooks(dbBooks);

      // Load progress for each book
      for (const book of dbBooks) {
        const progress = await repository.getReadingProgress(db, book.id);
        if (progress) {
          setProgress(book.id, progress);
        }
      }
    } catch (err) {
      libraryLog.error("Error loading books:", err);
      setError(err instanceof Error ? err.message : "Failed to load library");
    } finally {
      setIsLoading(false);
    }
  }, [db, isReady, setBooks, setProgress]);

  useEffect(() => {
    if (!isReady || !db) {
      return;
    }

    loadBooks();
  }, [db, isReady, loadBooks]);

  const books = getBooksWithProgress();

  return {
    books,
    isLoading,
    error,
    refresh: loadBooks,
  };
};

export default useLibrary;
