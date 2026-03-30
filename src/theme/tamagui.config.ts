/**
 * Tamagui configuration for Shelvr.
 *
 * Defines tokens, themes (light/dark/sepia/midnight × 10 accent colors),
 * fonts, and media queries.
 */

import { config as defaultConfig } from "@tamagui/config";
import { createFont, createTamagui, createTokens } from "tamagui";
import {
  accentColors,
  type AccentColorName,
  darkPalette,
  lightPalette,
  midnightPalette,
  palettes,
  sepiaPalette,
} from "./colors";

// ── Tokens ──────────────────────────────────────────────────────

const size = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 40,
  10: 48,
  11: 56,
  12: 64,
  true: 16,
} as const;

const space = { ...size } as const;

const radius = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  true: 8,
} as const;

const zIndex = {
  0: 0,
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
} as const;

const tokens = createTokens({
  size,
  space,
  radius,
  zIndex,
  color: {
    // Base neutrals (light defaults — themes override via theme objects)
    ...lightPalette,
    // Include all accents at token level for static reference
    ...accentColors.coral,
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
  },
});

// ── Fonts ───────────────────────────────────────────────────────

const interFont = createFont({
  family: "Inter",
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 15,
    6: 16,
    7: 18,
    8: 20,
    9: 24,
    10: 28,
    11: 32,
    12: 40,
    true: 16,
  },
  lineHeight: {
    1: 16,
    2: 18,
    3: 19,
    4: 20,
    5: 22,
    6: 24,
    7: 26,
    8: 28,
    9: 32,
    10: 36,
    11: 40,
    12: 48,
    true: 24,
  },
  weight: {
    1: "400",
    2: "400",
    3: "400",
    4: "400",
    5: "500",
    6: "500",
    7: "600",
    8: "600",
    9: "700",
    10: "700",
    11: "800",
    12: "800",
    true: "400",
  },
  letterSpacing: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: -0.2,
    8: -0.3,
    9: -0.4,
    10: -0.5,
    11: -0.6,
    12: -0.8,
    true: 0,
  },
  face: {
    400: { normal: "Inter" },
    500: { normal: "InterMedium" },
    600: { normal: "InterSemiBold" },
    700: { normal: "InterBold" },
    800: { normal: "InterExtraBold" },
  },
});

// ── Theme builder ───────────────────────────────────────────────

interface PaletteShape {
  background: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  border: string;
  borderFocus: string;
  overlay: string;
  success: string;
  warning: string;
  error: string;
  card: string;
}

function buildTheme(palette: PaletteShape, accentName: AccentColorName) {
  const a = accentColors[accentName];
  return {
    background: palette.background,
    backgroundHover: palette.surfaceHover,
    backgroundPress: palette.surfaceHover,
    backgroundFocus: palette.surface,
    color: palette.text,
    colorHover: palette.text,
    colorPress: palette.textSecondary,
    colorFocus: palette.text,
    borderColor: palette.border,
    borderColorHover: palette.borderFocus,
    borderColorFocus: palette.borderFocus,
    borderColorPress: palette.border,
    placeholderColor: palette.textSecondary,
    // Surfaces
    surface: palette.surface,
    surfaceHover: palette.surfaceHover,
    card: palette.card,
    overlay: palette.overlay,
    // Text
    text: palette.text,
    textSecondary: palette.textSecondary,
    // Accent
    accent: a.accent,
    accentLight: a.accentLight,
    accentDark: a.accentDark,
    // Semantic
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
  };
}

// Generate themes: light, dark, sepia, midnight — each with default accent
// Plus sub-themes for each accent color per base theme.

type ThemeName = keyof typeof palettes;
const themeNames: ThemeName[] = ["light", "dark", "sepia", "midnight"];
const accentNames = Object.keys(accentColors) as AccentColorName[];

const themes: Record<string, ReturnType<typeof buildTheme>> = {};

for (const themeName of themeNames) {
  const palette = palettes[themeName];
  // Default theme uses "coral" accent
  themes[themeName] = buildTheme(palette, "coral");
  // Sub-themes per accent: e.g. "light_coral", "dark_indigo"
  for (const accentName of accentNames) {
    themes[`${themeName}_${accentName}`] = buildTheme(palette, accentName);
  }
}

// ── Config ──────────────────────────────────────────────────────

export const tamaguiConfig = createTamagui({
  tokens,
  themes,
  fonts: {
    heading: interFont,
    body: interFont,
  },
  media: defaultConfig.media,
  animations: defaultConfig.animations,
  shorthands: {
    // Layout
    p: "padding",
    px: "paddingHorizontal",
    py: "paddingVertical",
    pt: "paddingTop",
    pb: "paddingBottom",
    pl: "paddingLeft",
    pr: "paddingRight",
    m: "margin",
    mx: "marginHorizontal",
    my: "marginVertical",
    mt: "marginTop",
    mb: "marginBottom",
    ml: "marginLeft",
    mr: "marginRight",
    w: "width",
    h: "height",
    bg: "backgroundColor",
    br: "borderRadius",
    bw: "borderWidth",
    bc: "borderColor",
    // Flex
    ai: "alignItems",
    jc: "justifyContent",
    f: "flex",
    fw: "flexWrap",
    fd: "flexDirection",
    fg: "flexGrow",
    fs: "flexShrink",
  } as const,
});

export type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}
