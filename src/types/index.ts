import { Book, ReadingProgress, UserPreferences } from "@/src/types/schemas";

export {
  BookSchema,
  // Schemas
  BookSourceSchema,
  FontFamilySchema,
  ReadingProgressSchema,
  ThemeSchema,
  UserPreferencesSchema,
  type Book,
  // Types
  type BookSource,
  type FontFamily,
  type ReadingProgress,
  type Theme,
  type UserPreferences,
} from "./schemas";

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "light",
  fontSize: 16,
  fontFamily: "original",
  lineSpacing: 1.5,
  reopenLastBookOnLaunch: false,
};

//  UI TYPES
export interface BookWithProgress extends Book {
  progress?: ReadingProgress;
}
