import type { BookWithProgress } from "@/src/types";
import { useCallback, useMemo, useState } from "react";

interface UseBookSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredBooks: BookWithProgress[];
  clearSearch: () => void;
}

/**
 * Hook for searching/filtering books by title and author
 */
export function useBookSearch(books: BookWithProgress[]): UseBookSearchReturn {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) {
      return books;
    }

    const query = searchQuery.toLowerCase().trim();

    return books.filter((book) => {
      // Search in title
      if (book.title.toLowerCase().includes(query)) {
        return true;
      }

      // Search in authors
      if (book.authors?.some((author) => author.toLowerCase().includes(query))) {
        return true;
      }

      return false;
    });
  }, [books, searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filteredBooks,
    clearSearch,
  };
}
