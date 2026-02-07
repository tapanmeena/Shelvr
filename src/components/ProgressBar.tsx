import { StyleSheet, View, useColorScheme } from "react-native";

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showBackground?: boolean;
  color?: string;
}

export function ProgressBar({ progress, height = 4, showBackground = true, color }: ProgressBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    background: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
    fill: color ?? "#e94560",
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.container, { height }, showBackground && { backgroundColor: colors.background }]}>
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
