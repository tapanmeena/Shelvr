import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  usePreferencesStore,
  useThemeColors,
} from "@/src/stores/preferencesStore";
import {
  ACCENT_COLOR_NAMES,
  accentColors,
  type AccentColorName,
  palettes,
} from "@/src/theme";
import type { Theme } from "@/src/types";

const THEMES: { id: Theme; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "sepia", label: "Sepia" },
  { id: "midnight", label: "Midnight" },
];

interface ThemePickerProps {
  value?: Theme;
  onChange?: (theme: Theme) => void;
  accentValue?: AccentColorName;
  onAccentChange?: (accent: AccentColorName) => void;
  showAccents?: boolean;
}

export function ThemePicker({
  value,
  onChange,
  accentValue,
  onAccentChange,
  showAccents = true,
}: ThemePickerProps) {
  const colors = useThemeColors();

  const currentTheme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const currentAccent = usePreferencesStore(
    (state) => state.accentColor,
  ) as AccentColorName;
  const setAccentColor = usePreferencesStore((state) => state.setAccentColor);

  const selectedTheme = value ?? currentTheme;
  const handleThemeChange = onChange ?? setTheme;
  const selectedAccent = accentValue ?? currentAccent;
  const handleAccentChange = onAccentChange ?? setAccentColor;

  return (
    <View style={styles.container}>
      {/* Theme selection */}
      <Text style={[styles.label, { color: colors.text }]}>Theme</Text>
      <View style={styles.themeOptions}>
        {THEMES.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          const palette = palettes[theme.id];
          return (
            <Pressable
              key={theme.id}
              style={[
                styles.themeOption,
                {
                  backgroundColor: palette.background,
                  borderColor: isSelected ? colors.accent : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => handleThemeChange(theme.id)}
            >
              <View
                style={[styles.colorPreview, { backgroundColor: palette.text }]}
              />
              <Text
                style={[
                  styles.themeLabel,
                  { color: palette.text },
                  isSelected && styles.themeLabelSelected,
                ]}
              >
                {theme.label}
              </Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.accent}
                  style={styles.checkIcon}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Accent color selection */}
      {showAccents && (
        <>
          <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>
            Accent Color
          </Text>
          <View style={styles.accentGrid}>
            {ACCENT_COLOR_NAMES.map((name) => {
              const isSelected = selectedAccent === name;
              const accent = accentColors[name];
              return (
                <Pressable
                  key={name}
                  style={[
                    styles.accentCircle,
                    { backgroundColor: accent.accent },
                    isSelected && {
                      borderWidth: 3,
                      borderColor: colors.text,
                    },
                  ]}
                  onPress={() => handleAccentChange(name)}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  themeOptions: {
    flexDirection: "row",
    gap: 10,
  },
  themeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  themeLabelSelected: {
    fontWeight: "700",
  },
  checkIcon: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  accentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  accentCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
