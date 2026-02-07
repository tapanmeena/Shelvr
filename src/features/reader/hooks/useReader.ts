import * as repository from "@/src/database/repository";
import { useDatabase, useDatabaseStatus } from "@/src/database/useDatabase";
import * as locationsCache from "@/src/features/reader/services/locationsCache";
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
  initialLocations: string[] | undefined;
  currentProgress: number;
  currentChapter: string | undefined;
  saveProgress: (cfi: string, progress: number | null, chapter?: string, chapterTitle?: string) => void;
  handleLocationsReady: (epubKey: string, locations: string[]) => void;
}

export const useReader = (bookId: string): UseReaderReturn => {
  const [book, setBook] = useState<Book | null>(null);
  const [initialLocation, setInitialLocation] = useState<string | undefined>(undefined);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLocations, setInitialLocations] = useState<string[] | undefined>(undefined);

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

        // Load cached locations for instant availability
        const cachedLocations = await locationsCache.loadLocations(bookId);
        if (cachedLocations) {
          setInitialLocations(cachedLocations);
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
    (cfi: string, progress: number | null, chapter?: string, chapterTitle?: string) => {
      if (!isReady || !db) {
        return;
      }

      // Only update percentage state/storage when locations are ready (progress is not null)
      const effectiveProgress = progress ?? currentProgress;

      if (progress !== null) {
        setCurrentProgress(progress);
      }
      setCurrentChapter(chapterTitle);

      // Check if we should save (significant change)
      const lastSave = lastSaveRef.current;
      const significantChange =
        !lastSave ||
        (progress !== null && Math.abs(effectiveProgress - lastSave.progress) >= 0.01) || // 1% change
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
          await progressService.saveProgress(db, bookId, cfi, effectiveProgress, chapter, chapterTitle);

          lastSaveRef.current = { cfi, progress: effectiveProgress };

          // Update store
          setProgressInStore(bookId, {
            bookId,
            cfi,
            percentage: effectiveProgress,
            chapter,
            chapterTitle,
            lastReadAt: Date.now(),
          });
        } catch (err) {
          readerLog.error("Error saving progress:", err);
        }
      }, 1000); // 1 second debounce
    },
    [bookId, db, isReady, currentProgress, setProgressInStore],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Cache locations when epub.js finishes generating them
  const handleLocationsReady = useCallback(
    (_epubKey: string, locations: string[]) => {
      readerLog.info(`Locations generated (${locations.length} total), caching for book ${bookId}`);
      locationsCache.saveLocations(bookId, locations);
    },
    [bookId],
  );

  return {
    book,
    isLoading,
    error,
    initialLocation,
    initialLocations,
    currentProgress,
    currentChapter,
    saveProgress,
    handleLocationsReady,
  };
};
