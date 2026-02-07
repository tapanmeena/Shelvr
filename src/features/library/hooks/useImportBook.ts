import * as repository from "@/src/database/repository";
import { useDatabase, useDatabaseStatus } from "@/src/database/useDatabase";
import { pickEpubFile } from "@/src/features/library/services/filePicker";
import { useLibraryStore } from "@/src/stores/libraryStore";
import { libraryLog } from "@/src/utils/logger";
import { useCallback, useState } from "react";
import { importBook as importBookService } from "../services/importBook";

interface UseImportBookReturn {
  isImporting: boolean;
  error: string | null;
  importBook: () => Promise<boolean>;
  clearError: () => void;
}

export const useImportBook = (): UseImportBookReturn => {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const db = useDatabase();
  const { isReady } = useDatabaseStatus();
  const addBook = useLibraryStore((state) => state.addBook);

  const importBook = useCallback(async (): Promise<boolean> => {
    setError(null);
    setIsImporting(true);

    try {
      if (!isReady || !db) {
        setError("Database is not ready yet");
        return false;
      }

      // Pickfile
      const pickResult = await pickEpubFile();
      if (!pickResult.success || !pickResult.file) {
        if (pickResult.error !== "File selection cancelled") {
          setError(pickResult.error ?? "Failed to pick file");
        }
        return false;
      }

      // Import book
      const importResult = await importBookService(pickResult.file);
      if (!importResult.success || !importResult.book) {
        setError(importResult.error ?? "Failed to import book");
        return false;
      }

      // Save to database
      await repository.insertBook(db, importResult.book);

      // Update store
      addBook(importResult.book);

      libraryLog.info("Book imported successfully:", importResult.book.title);
      return true;
    } catch (err) {
      libraryLog.error("Import error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occured");
      return false;
    } finally {
      setIsImporting(false);
    }
  }, [addBook, db, isReady]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isImporting,
    error,
    importBook,
    clearError,
  };
};
