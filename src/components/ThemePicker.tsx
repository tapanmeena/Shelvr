import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { THEME_COLORS, usePreferencesStore } from "@/src/stores/preferencesStore";
import type { Theme } from "@/src/types";

const THEMES: { id: Theme; label: string; colors: (typeof THEME_COLORS)["light"] }[] = [
  { id: "light", label: "Light", colors: THEME_COLORS.light },
  { id: "dark", label: "Dark", colors: THEME_COLORS.dark },
  { id: "sepia", label: "Sepia", colors: THEME_COLORS.sepia },
];

interface ThemePickerProps {
  value?: Theme;
  onChange?: (theme: Theme) => void;
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const currentTheme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);

  const selectedTheme = value ?? currentTheme;
  const handleChange = onChange ?? setTheme;

  const colors = {
    text: isDark ? "#eaeaea" : "#1a1a2e",
    subtext: isDark ? "#a0a0a0" : "#666666",
    border: isDark ? "#2d3748" : "#e2e8f0",
    primary: "#e94560",
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Theme</Text>
      <View style={styles.options}>
        {THEMES.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          return (
            <Pressable
              key={theme.id}
              style={[
                styles.option,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => handleChange(theme.id)}
            >
              <View style={[styles.colorPreview, { backgroundColor: theme.colors.text }]} />
              <Text style={[styles.optionLabel, { color: theme.colors.text }, isSelected && styles.optionLabelSelected]}>{theme.label}</Text>
              {isSelected && <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.checkIcon} />}
            </Pressable>
          );
        })}
      </View>
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
  options: {
    flexDirection: "row",
    gap: 12,
  },
  option: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  optionLabelSelected: {
    fontWeight: "600",
  },
  checkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
