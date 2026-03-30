import { Shelf } from "@/src/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ShelfState {
  shelves: Shelf[];
  /** Map of bookId → array of shelfIds the book belongs to */
  bookShelfMap: Record<string, string[]>;
}

interface ShelfActions {
  setShelves: (shelves: Shelf[]) => void;
  addShelf: (shelf: Shelf) => void;
  updateShelf: (
    id: string,
    updates: Partial<
      Pick<Shelf, "name" | "description" | "icon" | "color" | "sortOrder">
    >,
  ) => void;
  removeShelf: (id: string) => void;
  addBookToShelf: (bookId: string, shelfId: string) => void;
  removeBookFromShelf: (bookId: string, shelfId: string) => void;
  setBookShelves: (bookId: string, shelfIds: string[]) => void;
  getShelfBookIds: (shelfId: string) => string[];
  clear: () => void;
}

type ShelfStore = ShelfState & ShelfActions;

export const useShelfStore = create<ShelfStore>()(
  persist(
    (set, get) => ({
      shelves: [],
      bookShelfMap: {},

      setShelves: (shelves) => set({ shelves }),

      addShelf: (shelf) =>
        set((state) => ({ shelves: [...state.shelves, shelf] })),

      updateShelf: (id, updates) =>
        set((state) => ({
          shelves: state.shelves.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s,
          ),
        })),

      removeShelf: (id) =>
        set((state) => {
          // Remove shelf from list
          const shelves = state.shelves.filter((s) => s.id !== id);
          // Remove shelf from all book mappings
          const bookShelfMap = { ...state.bookShelfMap };
          for (const bookId of Object.keys(bookShelfMap)) {
            bookShelfMap[bookId] = bookShelfMap[bookId].filter(
              (sid) => sid !== id,
            );
            if (bookShelfMap[bookId].length === 0) {
              delete bookShelfMap[bookId];
            }
          }
          return { shelves, bookShelfMap };
        }),

      addBookToShelf: (bookId, shelfId) =>
        set((state) => {
          const current = state.bookShelfMap[bookId] ?? [];
          if (current.includes(shelfId)) return state;
          return {
            bookShelfMap: {
              ...state.bookShelfMap,
              [bookId]: [...current, shelfId],
            },
          };
        }),

      removeBookFromShelf: (bookId, shelfId) =>
        set((state) => {
          const current = state.bookShelfMap[bookId] ?? [];
          const updated = current.filter((sid) => sid !== shelfId);
          const bookShelfMap = { ...state.bookShelfMap };
          if (updated.length === 0) {
            delete bookShelfMap[bookId];
          } else {
            bookShelfMap[bookId] = updated;
          }
          return { bookShelfMap };
        }),

      setBookShelves: (bookId, shelfIds) =>
        set((state) => ({
          bookShelfMap: { ...state.bookShelfMap, [bookId]: shelfIds },
        })),

      getShelfBookIds: (shelfId) => {
        const { bookShelfMap } = get();
        return Object.entries(bookShelfMap)
          .filter(([, shelfIds]) => shelfIds.includes(shelfId))
          .map(([bookId]) => bookId);
      },

      clear: () => set({ shelves: [], bookShelfMap: {} }),
    }),
    {
      name: "shelvr-shelves",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        shelves: state.shelves,
        bookShelfMap: state.bookShelfMap,
      }),
    },
  ),
);
