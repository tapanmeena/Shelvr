import { Book, BookWithProgress, ReadingProgress } from "@/src/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LibraryState {
  books: Book[];
  progressMap: Record<string, ReadingProgress>;
  isLoading: boolean;
  lastUpdated: number | null;
}

interface LibraryActions {
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  removeBook: (id: string) => void;
  setProgress: (bookId: string, progress: ReadingProgress) => void;
  setLoading: (isLoading: boolean) => void;
  getBookWithProgress: (id: string) => BookWithProgress | undefined;
  getBooksWithProgress: () => BookWithProgress[];
  clear: () => void;
}

type LibraryStore = LibraryState & LibraryActions;

const initialState: LibraryState = {
  books: [],
  progressMap: {},
  isLoading: false,
  lastUpdated: null,
};

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setBooks: (books) =>
        set({
          books,
          lastUpdated: Date.now(),
        }),

      addBook: (book) =>
        set((state) => ({
          books: [book, ...state.books],
          lastUpdated: Date.now(),
        })),

      updateBook: (id, updates) =>
        set((state) => ({
          books: state.books.map((book) => (book.id === id ? { ...book, ...updates, updatedAt: Date.now() } : book)),
          lastUpdated: Date.now(),
        })),

      removeBook: (id) =>
        set((state) => {
          const { [id]: _, ...remainingProgress } = state.progressMap;
          return {
            books: state.books.filter((book) => book.id !== id),
            progressMap: remainingProgress,
            lastUpdated: Date.now(),
          };
        }),

      setProgress: (bookId, progress) =>
        set((state) => ({
          progressMap: {
            ...state.progressMap,
            [bookId]: progress,
          },
        })),

      setLoading: (isLoading) => set({ isLoading }),

      getBookWithProgress: (id) => {
        const state = get();
        const book = state.books.find((b) => b.id === id);
        if (!book) return undefined;
        return {
          ...book,
          progress: state.progressMap[id],
        };
      },

      getBooksWithProgress: () => {
        const state = get();
        return state.books.map((book) => ({
          ...book,
          progress: state.progressMap[book.id],
        }));
      },

      clear: () => set(initialState),
    }),
    {
      name: "shelvr-library",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        books: state.books,
        progressMap: state.progressMap,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
);
