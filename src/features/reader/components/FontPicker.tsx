import {
  useThemeColors,
  FONT_FAMILY_MAP,
  usePreferencesStore,
} from "@/src/stores/preferencesStore";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { FontFamily } from "@/src/types";

const FONTS: { id: FontFamily; label: string; preview: string }[] = [
  { id: "system", label: "System", preview: "Aa" },
  { id: "georgia", label: "Georgia", preview: "Aa" },
  { id: "palatino", label: "Palatino", preview: "Aa" },
  { id: "bookerly", label: "Bookerly", preview: "Aa" },
  { id: "openDyslexic", label: "OpenDyslexic", preview: "Aa" },
];

interface FontPickerProps {
  value?: FontFamily;
  onChange?: (font: FontFamily) => void;
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  const themeColors = useThemeColors();

  const currentFont = usePreferencesStore((state) => state.fontFamily);
  const setFontFamily = usePreferencesStore((state) => state.setFontFamily);

  const selectedFont = value ?? currentFont;
  const handleChange = onChange ?? setFontFamily;

  const colors = {
    text: themeColors.text,
    subtext: themeColors.textSecondary,
    border: themeColors.border,
    background: themeColors.background,
    primary: themeColors.accent,
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Font</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FONTS.map((font) => {
          const isSelected = selectedFont === font.id;
          return (
            <Pressable
              key={font.id}
              style={[
                styles.option,
                {
                  backgroundColor: colors.background,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => handleChange(font.id)}
            >
              <Text
                style={[
                  styles.preview,
                  { color: colors.text, fontFamily: FONT_FAMILY_MAP[font.id] },
                ]}
              >
                {font.preview}
              </Text>
              <Text
                style={[
                  styles.optionLabel,
                  { color: colors.subtext },
                  isSelected && { color: colors.primary },
                ]}
                numberOfLines={1}
              >
                {font.label}
              </Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.primary}
                  style={styles.checkIcon}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
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
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  option: {
    width: 80,
    height: 80,
    padding: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    fontSize: 24,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  checkIcon: {
    position: "absolute",
    top: 4,
    right: 4,
  },
});
