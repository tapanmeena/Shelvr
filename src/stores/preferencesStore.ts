import {
  DEFAULT_PREFERENCES,
  FontFamily,
  LibraryViewMode,
  ShelvesViewMode,
  Theme,
  UserPreferences,
} from "@/src/types";
import { type AccentColorName, accentColors, palettes } from "@/src/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PreferencesState extends UserPreferences {
  isHydrated: boolean;
}

interface PreferencesActions {
  setTheme: (theme: Theme) => void;
  setAccentColor: (accentColor: AccentColorName) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: FontFamily) => void;
  setLineSpacing: (spacing: number) => void;
  setLibraryViewMode: (mode: LibraryViewMode) => void;
  setShelvesViewMode: (mode: ShelvesViewMode) => void;
  setLastOpenedBook: (bookId: string | undefined) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  reset: () => void;
  setHydrated: (isHydrated: boolean) => void;
}

type PreferncesStore = PreferencesState & PreferencesActions;

const UNSUPPORTED_FONT_FALLBACKS: Partial<Record<FontFamily, FontFamily>> = {
  bookerly: "georgia",
  openDyslexic: "system",
};

export const AVAILABLE_READER_FONTS: FontFamily[] = [
  "original",
  "system",
  "georgia",
  "palatino",
];

export function normalizeReaderFontFamily(fontFamily: FontFamily): FontFamily {
  return (
    AVAILABLE_READER_FONTS.find(
      (availableFont) => availableFont === fontFamily,
    ) ??
    UNSUPPORTED_FONT_FALLBACKS[fontFamily] ??
    "original"
  );
}

export const usePreferencesStore = create<PreferncesStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      isHydrated: false,

      setTheme: (theme) => set({ theme }),

      setAccentColor: (accentColor) => set({ accentColor }),

      setFontSize: (fontSize) => {
        const clamped = Math.min(32, Math.max(12, fontSize));
        set({ fontSize: clamped });
      },

      setFontFamily: (fontFamily) =>
        set({ fontFamily: normalizeReaderFontFamily(fontFamily) }),

      setLineSpacing: (lineSpacing) => {
        // Clamp between 1.0 and 2.5
        const clamped = Math.min(2.5, Math.max(1.0, lineSpacing));
        set({ lineSpacing: clamped });
      },

      setLibraryViewMode: (libraryViewMode) => set({ libraryViewMode }),

      setShelvesViewMode: (shelvesViewMode) => set({ shelvesViewMode }),

      setLastOpenedBook: (lastOpenedBookId) => set({ lastOpenedBookId }),

      setHasCompletedOnboarding: (hasCompletedOnboarding) =>
        set({ hasCompletedOnboarding }),

      reset: () => set(DEFAULT_PREFERENCES),

      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: "shelvr-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        accentColor: state.accentColor,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        lineSpacing: state.lineSpacing,
        libraryViewMode: state.libraryViewMode,
        shelvesViewMode: state.shelvesViewMode,
        lastOpenedBookId: state.lastOpenedBookId,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setFontFamily(state.fontFamily);
        }
        state?.setHydrated(true);
      },
    },
  ),
);

/**
 * Font family CSS values
 */
export const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  original: "inherit",
  georgia: 'Georgia, "Times New Roman", serif',
  palatino: '"Palatino Linotype", Palatino, "Book Antiqua", serif',
  bookerly: "Bookerly, Georgia, serif",
  openDyslexic: "OpenDyslexic, sans-serif",
};

/**
 * Extended theme color palettes for app-wide use.
 * Resolves the active palette + accent color combination.
 */
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  primary: string;
  border: string;
  borderFocus: string;
  overlay: string;
  card: string;
  success: string;
  warning: string;
  error: string;
}

export function getThemeColors(
  theme: Theme,
  accent: AccentColorName = "coral",
): ThemeColors {
  const palette = palettes[theme];
  const a = accentColors[accent];
  return {
    background: palette.background,
    surface: palette.surface,
    surfaceHover: palette.surfaceHover,
    text: palette.text,
    textSecondary: palette.textSecondary,
    accent: a.accent,
    accentLight: a.accentLight,
    accentDark: a.accentDark,
    primary: a.accent,
    border: palette.border,
    borderFocus: palette.borderFocus,
    overlay: palette.overlay,
    card: palette.card,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
  };
}

/**
 * Hook to get current resolved theme colors.
 */
export function useThemeColors(): ThemeColors {
  const theme = usePreferencesStore((s) => s.theme);
  const accent = usePreferencesStore((s) => s.accentColor) as AccentColorName;
  return useMemo(() => getThemeColors(theme, accent), [theme, accent]);
}

/**
 * Get the combined Tamagui theme name: e.g. "dark_indigo"
 */
export function useTamaguiThemeName(): string {
  const theme = usePreferencesStore((s) => s.theme);
  const accent = usePreferencesStore((s) => s.accentColor) as AccentColorName;
  return `${theme}_${accent}`;
}
