import { Book, ReadingProgress, UserPreferences } from "@/src/types/schemas";

export {
  BookSchema,
  // Schemas
  BookSourceSchema,
  FontFamilySchema,
  AccentColorSchema,
  LibraryViewModeSchema,
  ShelfSchema,
  BookShelfSchema,
  ReadingProgressSchema,
  ThemeSchema,
  UserPreferencesSchema,
  type AccentColor,
  type Book,
  type BookShelf,
  // Types
  type BookSource,
  type FontFamily,
  type LibraryViewMode,
  type ReadingProgress,
  type Shelf,
  type Theme,
  type UserPreferences,
} from "./schemas";

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "light",
  accentColor: "coral",
  fontSize: 16,
  fontFamily: "original",
  lineSpacing: 1.5,
  libraryViewMode: "grid",
  reopenLastBookOnLaunch: false,
  hasCompletedOnboarding: false,
};

//  UI TYPES
export interface BookWithProgress extends Book {
  progress?: ReadingProgress;
}
