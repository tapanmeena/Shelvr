import * as repository from "@/src/database/repository";
import { useDatabase } from "@/src/database/useDatabase";
import type { BookWithProgress } from "@/src/types";
import { libraryLog } from "@/src/utils/logger";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseBookSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredBooks: BookWithProgress[];
  clearSearch: () => void;
}

const DEBOUNCE_MS = 300;

/**
 * Hook for searching/filtering books by title and author.
 * Uses the indexed DB LIKE query for text matching, then maps
 * results back to the in-memory BookWithProgress objects so
 * progress data is preserved.
 */
export function useBookSearch(books: BookWithProgress[]): UseBookSearchReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [matchedIds, setMatchedIds] = useState<Set<string> | null>(null);
  const db = useDatabase();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setMatchedIds(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        if (!db) {
          return;
        }
        const results = await repository.searchBooks(db, trimmed);
        setMatchedIds(new Set(results.map((b) => b.id)));
      } catch (err) {
        libraryLog.error("DB search failed, falling back to in-memory:", err);
        // Fallback: in-memory filter
        const query = trimmed.toLowerCase();
        const ids = new Set(
          books
            .filter(
              (book) =>
                book.title.toLowerCase().includes(query) ||
                book.authors?.some((a) => a.toLowerCase().includes(query)),
            )
            .map((b) => b.id),
        );
        setMatchedIds(ids);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, db, books]);

  const filteredBooks =
    matchedIds === null
      ? books
      : books.filter((book) => matchedIds.has(book.id));

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setMatchedIds(null);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filteredBooks,
    clearSearch,
  };
}
