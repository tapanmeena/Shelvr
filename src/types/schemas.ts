import { z } from "zod";

const optionalString = z.string().optional();

// Book
export const BookSourceSchema = z.enum(["local", "komga"]);

export const BookSchema = z
  .object({
    id: z.uuidv4(),
    title: z.string().min(1).max(500),
    authors: z.array(z.string()).optional(),
    description: optionalString,
    coverPath: optionalString,
    filePath: z.string().min(1),
    source: BookSourceSchema,
    komgaBookId: optionalString,
    komgaServerId: optionalString,
    fileSize: z.number().positive().optional(),
    pageCount: z.number().positive().optional(),
    publishedDate: optionalString,
    language: optionalString,
    series: optionalString,
    seriesIndex: z.number().optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
  })
  .refine(
    (data) => {
      if (data.source === "komga") {
        return (
          data.komgaBookId !== undefined && data.komgaServerId !== undefined
        );
      }
      return true;
    },
    {
      error: "Komga books require komgaBookId and komgaServerId",
    },
  );

// Reading Progress
export const ReadingProgressSchema = z.object({
  id: z.number().optional(),
  bookId: z.uuidv4(),
  cfi: optionalString,
  percentage: z.number().min(0).max(1),
  chapter: optionalString,
  chapterTitle: optionalString,
  lastReadAt: z.number(),
});

// USER PREFERENCES
export const ThemeSchema = z.enum(["light", "dark", "sepia", "midnight"]);

export const FontFamilySchema = z.enum([
  "system",
  "original",
  "georgia",
  "palatino",
  "bookerly",
  "openDyslexic",
]);

export const AccentColorSchema = z.enum([
  "coral",
  "amber",
  "terracotta",
  "sage",
  "wine",
  "indigo",
  "teal",
  "rose",
  "sky",
  "violet",
]);

export const LibraryViewModeSchema = z.enum(["grid", "list"]);

export const UserPreferencesSchema = z.object({
  theme: ThemeSchema,
  accentColor: AccentColorSchema,
  fontSize: z.number().min(12).max(32),
  fontFamily: FontFamilySchema,
  lineSpacing: z.number().min(1.0).max(2.5),
  libraryViewMode: LibraryViewModeSchema,
  reopenLastBookOnLaunch: z.boolean(),
  lastOpenedBookId: optionalString,
  hasCompletedOnboarding: z.boolean(),
});

export type BookSource = z.infer<typeof BookSourceSchema>;
export type Book = z.infer<typeof BookSchema>;
export type ReadingProgress = z.infer<typeof ReadingProgressSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type FontFamily = z.infer<typeof FontFamilySchema>;
export type AccentColor = z.infer<typeof AccentColorSchema>;
export type LibraryViewMode = z.infer<typeof LibraryViewModeSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// Shelf
export const ShelfSchema = z.object({
  id: z.uuidv4(),
  name: z.string().min(1).max(100),
  description: optionalString,
  icon: optionalString,
  color: optionalString,
  sortOrder: z.number().int(),
  isSmart: z.boolean(),
  smartFilter: optionalString,
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const BookShelfSchema = z.object({
  bookId: z.uuidv4(),
  shelfId: z.uuidv4(),
  addedAt: z.number(),
});

export type Shelf = z.infer<typeof ShelfSchema>;
export type BookShelf = z.infer<typeof BookShelfSchema>;
