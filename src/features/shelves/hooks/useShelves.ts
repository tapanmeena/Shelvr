import * as repository from "@/src/database/repository";
import { useDatabase } from "@/src/database/useDatabase";
import { useShelfStore } from "@/src/stores/shelfStore";
import { Shelf } from "@/src/types";
import { libraryLog } from "@/src/utils/logger";
import { useCallback, useEffect, useState } from "react";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export function useShelves() {
  const db = useDatabase();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shelves = useShelfStore((s) => s.shelves);
  const setShelves = useShelfStore((s) => s.setShelves);
  const addShelfToStore = useShelfStore((s) => s.addShelf);
  const updateShelfInStore = useShelfStore((s) => s.updateShelf);
  const removeShelfFromStore = useShelfStore((s) => s.removeShelf);
  const addBookToShelfStore = useShelfStore((s) => s.addBookToShelf);
  const removeBookFromShelfStore = useShelfStore((s) => s.removeBookFromShelf);

  const loadShelves = useCallback(async () => {
    try {
      setIsLoading(true);
      const dbShelves = await repository.getShelves(db);
      setShelves(dbShelves);
      setError(null);
    } catch (err) {
      libraryLog.error("Failed to load shelves:", err);
      setError("Failed to load shelves");
    } finally {
      setIsLoading(false);
    }
  }, [db, setShelves]);

  useEffect(() => {
    loadShelves();
  }, [loadShelves]);

  const createShelf = useCallback(
    async (
      name: string,
      options?: { description?: string; icon?: string; color?: string },
    ) => {
      const now = Date.now();
      const shelf: Shelf = {
        id: uuidv4(),
        name,
        description: options?.description,
        icon: options?.icon,
        color: options?.color,
        sortOrder: shelves.length,
        isSmart: false,
        createdAt: now,
        updatedAt: now,
      };

      try {
        await repository.createShelf(db, shelf);
        addShelfToStore(shelf);
        return shelf;
      } catch (err) {
        libraryLog.error("Failed to create shelf:", err);
        throw err;
      }
    },
    [db, shelves.length, addShelfToStore],
  );

  const updateShelf = useCallback(
    async (
      id: string,
      updates: Partial<
        Pick<Shelf, "name" | "description" | "icon" | "color" | "sortOrder">
      >,
    ) => {
      try {
        await repository.updateShelf(db, id, updates);
        updateShelfInStore(id, updates);
      } catch (err) {
        libraryLog.error("Failed to update shelf:", err);
        throw err;
      }
    },
    [db, updateShelfInStore],
  );

  const deleteShelf = useCallback(
    async (id: string) => {
      try {
        await repository.deleteShelf(db, id);
        removeShelfFromStore(id);
      } catch (err) {
        libraryLog.error("Failed to delete shelf:", err);
        throw err;
      }
    },
    [db, removeShelfFromStore],
  );

  const addBookToShelf = useCallback(
    async (bookId: string, shelfId: string) => {
      try {
        await repository.addBookToShelf(db, bookId, shelfId);
        addBookToShelfStore(bookId, shelfId);
      } catch (err) {
        libraryLog.error("Failed to add book to shelf:", err);
        throw err;
      }
    },
    [db, addBookToShelfStore],
  );

  const removeBookFromShelf = useCallback(
    async (bookId: string, shelfId: string) => {
      try {
        await repository.removeBookFromShelf(db, bookId, shelfId);
        removeBookFromShelfStore(bookId, shelfId);
      } catch (err) {
        libraryLog.error("Failed to remove book from shelf:", err);
        throw err;
      }
    },
    [db, removeBookFromShelfStore],
  );

  const getShelfBooks = useCallback(
    async (shelfId: string) => {
      return repository.getShelfBooks(db, shelfId);
    },
    [db],
  );

  return {
    shelves,
    isLoading,
    error,
    refresh: loadShelves,
    createShelf,
    updateShelf,
    deleteShelf,
    addBookToShelf,
    removeBookFromShelf,
    getShelfBooks,
  };
}
