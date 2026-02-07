import * as repository from "@/src/database/repository";
import { useDatabase, useDatabaseStatus } from "@/src/database/useDatabase";
import * as progressService from "@/src/features/reader/services/progressService";
import { useLibraryStore } from "@/src/stores/libraryStore";
import { usePreferencesStore } from "@/src/stores/preferencesStore";
import { Book } from "@/src/types";
import { readerLog } from "@/src/utils/logger";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseReaderReturn {
  book: Book | null;
  isLoading: boolean;
  error: string | null;
  initialLocation: string | undefined;
  currentProgress: number;
  currentChapter: string | undefined;
  saveProgress: (cfi: string, progress: number, chapter?: string, chapterTitle?: string) => void;
}

export const useReader = (bookId: string): UseReaderReturn => {
  const [book, setBook] = useState<Book | null>(null);
  const [initialLocation, setInitialLocation] = useState<string | undefined>(undefined);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const db = useDatabase();
  const { isReady } = useDatabaseStatus();
  const setProgressInStore = useLibraryStore((state) => state.setProgress);
  const setLastOpenedBook = usePreferencesStore((state) => state.setLastOpenedBook);

  // Debounce save to avoid too many writes
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveRef = useRef<{ cfi: string; progress: number } | null>(null);

  // Load book and progress on mount
  useEffect(() => {
    const loadBook = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!isReady || !db) {
          return;
        }

        // Load book from database
        const dbBook = await repository.getBookById(db, bookId);
        if (!dbBook) {
          setError("Book not found");
          return;
        }

        setBook(dbBook);

        // Load reading progress
        const progress = await progressService.loadProgress(db, bookId);
        if (progress) {
          setInitialLocation(progress.cfi);
          setCurrentProgress(progress.percentage);
          setCurrentChapter(progress.chapterTitle);
        }

        // Update last opened book
        setLastOpenedBook(bookId);
      } catch (err) {
        readerLog.error("Error loading book:", err);
        setError(err instanceof Error ? err.message : "Failed to load book");
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();
  }, [bookId, db, isReady, setLastOpenedBook]);

  // Save progress with debouncing
  const saveProgress = useCallback(
    (cfi: string, progress: number, chapter?: string, chapterTitle?: string) => {
      if (!isReady || !db) {
        return;
      }

      // Update local state immediately
      setCurrentProgress(progress);
      setCurrentChapter(chapterTitle);

      // Check if we should save (significant change)
      const lastSave = lastSaveRef.current;
      const significantChange =
        !lastSave ||
        Math.abs(progress - lastSave.progress) >= 0.01 || // 1% change
        cfi !== lastSave.cfi;

      if (!significantChange) {
        return;
      }

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce the save
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await progressService.saveProgress(db, bookId, cfi, progress, chapter, chapterTitle);

          lastSaveRef.current = { cfi, progress };

          // Update store
          setProgressInStore(bookId, {
            bookId,
            cfi,
            percentage: progress,
            chapter,
            chapterTitle,
            lastReadAt: Date.now(),
          });
        } catch (err) {
          readerLog.error("Error saving progress:", err);
        }
      }, 1000); // 1 second debounce
    },
    [bookId, db, isReady, setProgressInStore],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    book,
    isLoading,
    error,
    initialLocation,
    currentProgress,
    currentChapter,
    saveProgress,
  };
};
