import { StyleSheet, View } from "react-native";
import { useThemeColors } from "@/src/stores/preferencesStore";

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showBackground?: boolean;
  color?: string;
}

export function ProgressBar({
  progress,
  height = 4,
  showBackground = true,
  color,
}: ProgressBarProps) {
  const themeColors = useThemeColors();

  const colors = {
    background: themeColors.border,
    fill: color ?? themeColors.accent,
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View
      style={[
        styles.container,
        { height },
        showBackground && { backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: colors.fill,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
});
