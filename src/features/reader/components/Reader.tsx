import { Reader as EpubReader, useReader as useEpubReader } from "@epubjs-react-native/core";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View, useColorScheme } from "react-native";

import { useFileSystem } from "@/lib/useFileSystem";
import { FONT_FAMILY_MAP, THEME_COLORS, usePreferencesStore } from "@/src/stores/preferencesStore";
import type { Theme } from "@/src/types";
import { readerLog } from "@/src/utils/logger";

interface ReaderProps {
  bookPath: string;
  initialLocation?: string;
  initialLocations?: string[];
  onLocationChange?: (cfi: string, progress: number | null, chapter?: string) => void;
  onLocationsReady?: (epubKey: string, locations: string[]) => void;
  onReady?: () => void;
  onError?: (reason: string) => void;
}

export function Reader({ bookPath, initialLocation, initialLocations, onLocationChange, onLocationsReady, onReady, onError }: ReaderProps) {
  const colorScheme = useColorScheme();
  const [, setIsReady] = useState(false);

  // Get user preferences
  const theme = usePreferencesStore((state) => state.theme);
  const fontSize = usePreferencesStore((state) => state.fontSize);
  const fontFamily = usePreferencesStore((state) => state.fontFamily);
  const lineSpacing = usePreferencesStore((state) => state.lineSpacing);

  // Get theme colors
  const effectiveTheme: Theme = theme === "light" || theme === "dark" || theme === "sepia" ? theme : colorScheme === "dark" ? "dark" : "light";
  const themeColors = THEME_COLORS[effectiveTheme];

  // Memoize theme object to prevent unnecessary re-renders
  const defaultTheme = useMemo(
    () => ({
      body: {
        background: themeColors.background,
        color: themeColors.text,
        "font-family": FONT_FAMILY_MAP[fontFamily],
        "font-size": `${fontSize}px`,
        "line-height": String(lineSpacing),
      },
    }),
    [themeColors.background, themeColors.text, fontFamily, fontSize, lineSpacing],
  );

  const handleLocationChange = useCallback(
    (
      _totalLocations: number,
      _currentLocation: {
        start: { cfi: string; percentage: number; location: number };
      },
      progress: number,
      _currentSection: { href: string; title?: string } | null,
    ) => {
      if (!onLocationChange || !_currentLocation?.start) return;

      const locationsReady = _totalLocations > 0 && _currentLocation.start.location !== -1;
      const percentage = locationsReady ? _currentLocation.start.percentage : null;

      // Always save CFI for position tracking; percentage is null until locations are generated
      onLocationChange(_currentLocation.start.cfi, percentage, _currentSection?.title);
    },
    [onLocationChange],
  );

  const handleReady = useCallback(() => {
    setIsReady(true);
    onReady?.();
  }, [onReady]);

  const handleError = useCallback(
    (reason: string) => {
      readerLog.error("Reader error:", reason);
      onError?.(reason);
    },
    [onError],
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <EpubReader
        src={bookPath}
        fileSystem={useFileSystem}
        initialLocation={initialLocation}
        initialLocations={initialLocations}
        enableSwipe={true}
        onLocationChange={handleLocationChange}
        onLocationsReady={onLocationsReady}
        onReady={handleReady}
        onDisplayError={handleError}
        enableSelection={true}
        defaultTheme={defaultTheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Re-export the useReader hook for external use
export { useEpubReader };
