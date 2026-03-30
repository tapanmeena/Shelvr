/**
 * Color palettes for 4 app themes + 10 accent colors.
 * Used as the source of truth for Tamagui token generation.
 */

// ── Theme palettes ──────────────────────────────────────────────

export const lightPalette = {
  background: "#FAFAF9",
  surface: "#F5F5F4",
  surfaceHover: "#EDEDEC",
  text: "#1C1917",
  textSecondary: "#78716C",
  border: "#E7E5E4",
  borderFocus: "#A8A29E",
  overlay: "rgba(0, 0, 0, 0.4)",
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",
  card: "#FFFFFF",
} as const;

export const darkPalette = {
  background: "#0A0A0A",
  surface: "#171717",
  surfaceHover: "#262626",
  text: "#E5E5E5",
  textSecondary: "#A3A3A3",
  border: "#2E2E2E",
  borderFocus: "#525252",
  overlay: "rgba(0, 0, 0, 0.6)",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  card: "#1A1A1A",
} as const;

export const sepiaPalette = {
  background: "#F5F0E8",
  surface: "#EBE4D4",
  surfaceHover: "#E0D8C6",
  text: "#4A3728",
  textSecondary: "#7A6652",
  border: "#D4C9B5",
  borderFocus: "#B5A68E",
  overlay: "rgba(74, 55, 40, 0.4)",
  success: "#6B8E23",
  warning: "#CD853F",
  error: "#CD5C5C",
  card: "#F0E9DB",
} as const;

export const midnightPalette = {
  background: "#0F172A",
  surface: "#1E293B",
  surfaceHover: "#2D3A4F",
  text: "#E2E8F0",
  textSecondary: "#94A3B8",
  border: "#334155",
  borderFocus: "#475569",
  overlay: "rgba(15, 23, 42, 0.6)",
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  card: "#1A2540",
} as const;

export const palettes = {
  light: lightPalette,
  dark: darkPalette,
  sepia: sepiaPalette,
  midnight: midnightPalette,
} as const;

// ── Accent colors ───────────────────────────────────────────────

export const accentColors = {
  coral: { accent: "#F97066", accentLight: "#FCA5A1", accentDark: "#DC4A3F" },
  amber: { accent: "#F59E0B", accentLight: "#FCD34D", accentDark: "#D97706" },
  terracotta: {
    accent: "#C2703E",
    accentLight: "#D9976E",
    accentDark: "#A35828",
  },
  sage: { accent: "#6B8F71", accentLight: "#95B89A", accentDark: "#4F7254" },
  wine: { accent: "#8B2252", accentLight: "#B84D7A", accentDark: "#6E1A40" },
  indigo: { accent: "#6366F1", accentLight: "#A5B4FC", accentDark: "#4F46E5" },
  teal: { accent: "#14B8A6", accentLight: "#5EEAD4", accentDark: "#0D9488" },
  rose: { accent: "#F43F5E", accentLight: "#FDA4AF", accentDark: "#E11D48" },
  sky: { accent: "#0EA5E9", accentLight: "#7DD3FC", accentDark: "#0284C7" },
  violet: { accent: "#8B5CF6", accentLight: "#C4B5FD", accentDark: "#7C3AED" },
} as const;

export type AccentColorName = keyof typeof accentColors;

export const ACCENT_COLOR_NAMES = Object.keys(
  accentColors,
) as AccentColorName[];
