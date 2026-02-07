import { DEFAULT_PREFERENCES, FontFamily, Theme, UserPreferences } from "@/src/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PreferencesState extends UserPreferences {
  isHydrated: boolean;
}

interface PreferencesActions {
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: FontFamily) => void;
  setLineSpacing: (spacing: number) => void;
  setLastOpenedBook: (bookId: string | undefined) => void;
  reset: () => void;
  setHydrated: (isHydrated: boolean) => void;
}

type PreferncesStore = PreferencesState & PreferencesActions;

export const usePreferencesStore = create<PreferncesStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      isHydrated: false,

      setTheme: (theme) => set({ theme }),

      setFontSize: (fontSize) => {
        const clamped = Math.min(32, Math.max(12, fontSize));
        set({ fontSize: clamped });
      },

      setFontFamily: (fontFamily) => set({ fontFamily }),

      setLineSpacing: (lineSpacing) => {
        // Clamp between 1.0 and 2.5
        const clamped = Math.min(2.5, Math.max(1.0, lineSpacing));
        set({ lineSpacing: clamped });
      },

      setLastOpenedBook: (lastOpenedBookId) => set({ lastOpenedBookId }),

      reset: () => set(DEFAULT_PREFERENCES),

      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: "shelvr-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        lineSpacing: state.lineSpacing,
        lastOpenedBookId: state.lastOpenedBookId,
      }),
      onRehydrateStorage: () => (state) => {
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
 * Extended theme color palettes for app-wide use
 */
export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  primary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export const THEME_COLORS: Record<Theme, ThemeColors> = {
  light: {
    background: "#ffffff",
    surface: "#f5f5f5",
    text: "#1a1a2e",
    textSecondary: "#666666",
    accent: "#e94560",
    primary: "#e94560",
    border: "#e0e0e0",
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
  },
  dark: {
    background: "#1a1a2e",
    surface: "#252540",
    text: "#eaeaea",
    textSecondary: "#a0a0a0",
    accent: "#e94560",
    primary: "#e94560",
    border: "#3a3a5a",
    success: "#66bb6a",
    warning: "#ffa726",
    error: "#ef5350",
  },
  sepia: {
    background: "#f4ecd8",
    surface: "#ebe3cf",
    text: "#5c4b37",
    textSecondary: "#8b7355",
    accent: "#8b4513",
    primary: "#8b4513",
    border: "#d4c9b5",
    success: "#6b8e23",
    warning: "#cd853f",
    error: "#cd5c5c",
  },
};
