import Slider from "@react-native-community/slider";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  usePreferencesStore,
  useThemeColors,
} from "@/src/stores/preferencesStore";
import { DEFAULT_PREFERENCES } from "@/src/types";

interface FontSizeSliderProps {
  value?: number;
  onChange?: (size: number) => void;
  min?: number;
  max?: number;
}

export function FontSizeSlider({
  value,
  onChange,
  min = 12,
  max = 32,
}: FontSizeSliderProps) {
  const themeColors = useThemeColors();

  const currentSize = usePreferencesStore((state) => state.fontSize);
  const setFontSize = usePreferencesStore((state) => state.setFontSize);

  const selectedSize = value ?? currentSize;
  const handleChange = onChange ?? setFontSize;

  const colors = {
    text: themeColors.text,
    subtext: themeColors.textSecondary,
    primary: themeColors.accent,
    track: themeColors.border,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>Font Size</Text>
        <View style={styles.headerRight}>
          <Text style={[styles.value, { color: colors.primary }]}>
            {selectedSize}px
          </Text>
          {selectedSize !== DEFAULT_PREFERENCES.fontSize && (
            <Pressable
              onPress={() => handleChange(DEFAULT_PREFERENCES.fontSize)}
              hitSlop={8}
            >
              <Ionicons
                name="refresh-outline"
                size={16}
                color={colors.subtext}
              />
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.sliderContainer}>
        <Text style={[styles.previewSmall, { color: colors.subtext }]}>A</Text>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={1}
          value={selectedSize}
          onValueChange={handleChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.track}
          thumbTintColor={colors.primary}
        />
        <Text style={[styles.previewLarge, { color: colors.subtext }]}>A</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  previewSmall: {
    fontSize: 12,
    fontWeight: "500",
  },
  previewLarge: {
    fontSize: 24,
    fontWeight: "500",
  },
});
