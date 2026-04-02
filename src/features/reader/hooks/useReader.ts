import * as repository from "@/src/database/repository";
import { useDatabase, useDatabaseStatus } from "@/src/database/useDatabase";
import * as locationsCache from "@/src/features/reader/services/locationsCache";
import * as progressService from "@/src/features/reader/services/progressService";
import { useLibraryStore } from "@/src/stores/libraryStore";
import { usePreferencesStore } from "@/src/stores/preferencesStore";
import { Book } from "@/src/types";
import { dbLog, readerLog } from "@/src/utils/logger";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseReaderReturn {
  book: Book | null;
  isLoading: boolean;
  error: string | null;
  initialLocation: string | undefined;
  initialLocations: string[] | undefined;
  currentProgress: number;
  currentChapter: string | undefined;
  currentChapterHref: string | undefined;
  saveProgress: (
    cfi: string,
    progress: number | null,
    chapter?: string,
    chapterTitle?: string,
  ) => void;
  flushProgress: () => Promise<void>;
  handleLocationsReady: (epubKey: string, locations: string[]) => void;
}

interface ProgressSnapshot {
  cfi: string;
  progress: number;
  chapter?: string;
  chapterTitle?: string;
}

function areSnapshotsEquivalent(
  first: ProgressSnapshot | null,
  second: ProgressSnapshot | null,
): boolean {
  if (!first || !second) {
    return false;
  }

  return (
    first.cfi === second.cfi &&
    Math.abs(first.progress - second.progress) < 0.01 &&
    first.chapter === second.chapter &&
    first.chapterTitle === second.chapterTitle
  );
}

export const useReader = (bookId: string): UseReaderReturn => {
  const [book, setBook] = useState<Book | null>(null);
  const [initialLocation, setInitialLocation] = useState<string | undefined>(
    undefined,
  );
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState<string | undefined>(
    undefined,
  );
  const [currentChapterHref, setCurrentChapterHref] = useState<
    string | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLocations, setInitialLocations] = useState<
    string[] | undefined
  >(undefined);

  const db = useDatabase();
  const { isReady } = useDatabaseStatus();
  const setProgressInStore = useLibraryStore((state) => state.setProgress);
  const setLastOpenedBook = usePreferencesStore(
    (state) => state.setLastOpenedBook,
  );

  // Debounce save to avoid too many writes
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveRef = useRef<ProgressSnapshot | null>(null);
  const pendingProgressRef = useRef<ProgressSnapshot | null>(null);

  // Load book and progress on mount
  useEffect(() => {
    const loadBook = async () => {
      if (!isReady || !db) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Load book from database
        const dbBook = await repository.getBookById(db, bookId);
        dbLog.debug("Loaded book from DB:", dbBook);
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
          setCurrentChapterHref(progress.chapter);

          if (progress.cfi) {
            lastSaveRef.current = {
              cfi: progress.cfi,
              progress: progress.percentage,
              chapter: progress.chapter,
              chapterTitle: progress.chapterTitle,
            };
          }
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
  const flushProgress = useCallback(async () => {
    if (!isReady || !db || !pendingProgressRef.current) {
      return;
    }

    const pendingProgress = pendingProgressRef.current;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (areSnapshotsEquivalent(lastSaveRef.current, pendingProgress)) {
      return;
    }

    try {
      await progressService.saveProgress(
        db,
        bookId,
        pendingProgress.cfi,
        pendingProgress.progress,
        pendingProgress.chapter,
        pendingProgress.chapterTitle,
      );

      lastSaveRef.current = pendingProgress;

      setProgressInStore(bookId, {
        bookId,
        cfi: pendingProgress.cfi,
        percentage: pendingProgress.progress,
        chapter: pendingProgress.chapter,
        chapterTitle: pendingProgress.chapterTitle,
        lastReadAt: Date.now(),
      });
    } catch (err) {
      readerLog.error("Error saving progress:", err);
    }
  }, [bookId, db, isReady, setProgressInStore]);

  const saveProgress = useCallback(
    (
      cfi: string,
      progress: number | null,
      chapter?: string,
      chapterTitle?: string,
    ) => {
      if (!isReady || !db) {
        return;
      }

      // Only update percentage state/storage when locations are ready (progress is not null)
      const effectiveProgress = progress ?? currentProgress;

      if (progress !== null) {
        setCurrentProgress(progress);
      }
      setCurrentChapterHref(chapter);
      setCurrentChapter(chapterTitle);

      const progressSnapshot = {
        cfi,
        progress: effectiveProgress,
        chapter,
        chapterTitle,
      };

      pendingProgressRef.current = progressSnapshot;

      // Check if we should save (significant change)
      if (areSnapshotsEquivalent(lastSaveRef.current, progressSnapshot)) {
        return;
      }

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce the save
      saveTimeoutRef.current = setTimeout(() => {
        void flushProgress();
      }, 1000); // 1 second debounce
    },
    [db, isReady, currentProgress, flushProgress],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      void flushProgress();
    };
  }, [flushProgress]);

  // Cache locations when epub.js finishes generating them
  const handleLocationsReady = useCallback(
    (_epubKey: string, locations: string[]) => {
      readerLog.info(
        `Locations generated (${locations.length} total), caching for book ${bookId}`,
      );
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
    currentChapterHref,
    saveProgress,
    flushProgress,
    handleLocationsReady,
  };
};
