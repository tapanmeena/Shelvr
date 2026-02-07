import { readerLog } from "@/src/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCATIONS_KEY_PREFIX = "shelvr_locations_";

/**
 * Save generated epub locations to AsyncStorage for a given book.
 * This avoids the expensive location generation on every book open.
 */
export const saveLocations = async (bookId: string, locations: string[]): Promise<void> => {
  try {
    const key = `${LOCATIONS_KEY_PREFIX}${bookId}`;
    await AsyncStorage.setItem(key, JSON.stringify(locations));
    readerLog.debug(`Cached ${locations.length} locations for book ${bookId}`);
  } catch (err) {
    readerLog.error("Error saving locations cache:", err);
  }
};

/**
 * Load cached epub locations from AsyncStorage.
 * Returns null if no cached locations exist.
 */
export const loadLocations = async (bookId: string): Promise<string[] | null> => {
  try {
    const key = `${LOCATIONS_KEY_PREFIX}${bookId}`;
    const json = await AsyncStorage.getItem(key);
    if (!json) return null;

    const locations = JSON.parse(json) as string[];
    readerLog.debug(`Loaded ${locations.length} cached locations for book ${bookId}`);
    return locations;
  } catch (err) {
    readerLog.error("Error loading locations cache:", err);
    return null;
  }
};

/**
 * Remove cached locations for a book (e.g. when book is deleted).
 */
export const removeLocations = async (bookId: string): Promise<void> => {
  try {
    const key = `${LOCATIONS_KEY_PREFIX}${bookId}`;
    await AsyncStorage.removeItem(key);
  } catch (err) {
    readerLog.error("Error removing locations cache:", err);
  }
};
