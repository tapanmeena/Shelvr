// import Slider from "@react-native-community/slider";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { usePreferencesStore } from "@/src/stores/preferencesStore";

interface FontSizeSliderProps {
  value?: number;
  onChange?: (size: number) => void;
  min?: number;
  max?: number;
}

export function FontSizeSlider({ value, onChange, min = 12, max = 32 }: FontSizeSliderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const currentSize = usePreferencesStore((state) => state.fontSize);
  const setFontSize = usePreferencesStore((state) => state.setFontSize);

  const selectedSize = value ?? currentSize;
  const handleChange = onChange ?? setFontSize;

  const colors = {
    text: isDark ? "#eaeaea" : "#1a1a2e",
    subtext: isDark ? "#a0a0a0" : "#666666",
    primary: "#e94560",
    track: isDark ? "#4a5568" : "#e2e8f0",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>Font Size</Text>
        <Text style={[styles.value, { color: colors.primary }]}>{selectedSize}px</Text>
      </View>
      <View style={styles.sliderContainer}>
        <Text style={[styles.previewSmall, { color: colors.subtext }]}>A</Text>
        {/* <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={1}
          value={selectedSize}
          onValueChange={handleChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.track}
          thumbTintColor={colors.primary}
        /> */}
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
