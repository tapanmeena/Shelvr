// import Slider from "@react-native-community/slider";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { usePreferencesStore } from "@/src/stores/preferencesStore";

interface LineSpacingSliderProps {
  value?: number;
  onChange?: (spacing: number) => void;
  min?: number;
  max?: number;
}

export function LineSpacingSlider({ value, onChange, min = 1.0, max = 2.5 }: LineSpacingSliderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const currentSpacing = usePreferencesStore((state) => state.lineSpacing);
  const setLineSpacing = usePreferencesStore((state) => state.setLineSpacing);

  const selectedSpacing = value ?? currentSpacing;
  const handleChange = onChange ?? setLineSpacing;

  const colors = {
    text: isDark ? "#eaeaea" : "#1a1a2e",
    subtext: isDark ? "#a0a0a0" : "#666666",
    primary: "#e94560",
    track: isDark ? "#4a5568" : "#e2e8f0",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>Line Spacing</Text>
        <Text style={[styles.value, { color: colors.primary }]}>{selectedSpacing.toFixed(1)}</Text>
      </View>
      <View style={styles.sliderContainer}>
        <View style={styles.previewCompact}>
          <View style={[styles.line, { backgroundColor: colors.subtext }]} />
          <View style={[styles.line, styles.lineNarrow, { backgroundColor: colors.subtext }]} />
          <View style={[styles.line, { backgroundColor: colors.subtext }]} />
        </View>
        {/* <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={0.1}
          value={selectedSpacing}
          onValueChange={handleChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.track}
          thumbTintColor={colors.primary}
        /> */}
        <View style={styles.previewWide}>
          <View style={[styles.line, { backgroundColor: colors.subtext }]} />
          <View style={[styles.line, styles.lineWide, { backgroundColor: colors.subtext }]} />
          <View style={[styles.line, { backgroundColor: colors.subtext }]} />
        </View>
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
  previewCompact: {
    width: 20,
    gap: 2,
  },
  previewWide: {
    width: 20,
    gap: 6,
  },
  line: {
    height: 2,
    borderRadius: 1,
  },
  lineNarrow: {
    marginTop: 1,
    marginBottom: 1,
  },
  lineWide: {
    marginTop: 4,
    marginBottom: 4,
  },
});
