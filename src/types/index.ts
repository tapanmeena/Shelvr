import {
  Book,
  ReadingProgress,
  Shelf,
  UserPreferences,
} from "@/src/types/schemas";

export {
  BookSchema,
  // Schemas
  BookSourceSchema,
  FontFamilySchema,
  AccentColorSchema,
  LibraryViewModeSchema,
  ShelvesViewModeSchema,
  PageAnimationSchema,
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
  type PageAnimation,
  type ReadingProgress,
  type Shelf,
  type ShelvesViewMode,
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
  shelvesViewMode: "cards",
  pageAnimation: "slide",
  reopenLastBookOnLaunch: false,
  hasCompletedOnboarding: false,
};

//  UI TYPES
export interface BookWithProgress extends Book {
  progress?: ReadingProgress;
}

export interface ImportingBook {
  id: string;
  title: string;
  authors?: string[];
  coverPath?: string;
  isImporting: true;
  statusLabel: string;
}

export interface ShelfWithPreview extends Shelf {
  bookCount: number;
  /** First 4 book cover paths (null if book has no cover) */
  coverPaths: (string | null)[];
}
