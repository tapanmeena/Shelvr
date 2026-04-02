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
  const booksRef = useRef(books);
  booksRef.current = books;
  const searchSeqRef = useRef(0);

  const filterInMemory = useCallback((query: string): Set<string> => {
    const lower = query.toLowerCase();
    return new Set(
      booksRef.current
        .filter(
          (book) =>
            book.title.toLowerCase().includes(lower) ||
            book.authors?.some((a) => a.toLowerCase().includes(lower)),
        )
        .map((b) => b.id),
    );
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setMatchedIds(null);
      return;
    }

    const seq = ++searchSeqRef.current;

    debounceRef.current = setTimeout(async () => {
      if (!db) {
        if (seq === searchSeqRef.current) {
          setMatchedIds(filterInMemory(trimmed));
        }
        return;
      }

      try {
        const results = await repository.searchBooks(db, trimmed);
        if (seq === searchSeqRef.current) {
          setMatchedIds(new Set(results.map((b) => b.id)));
        }
      } catch (err) {
        libraryLog.error("DB search failed, falling back to in-memory:", err);
        if (seq === searchSeqRef.current) {
          setMatchedIds(filterInMemory(trimmed));
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, db, filterInMemory]);

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
