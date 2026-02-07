import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = "large", message, fullScreen = false }: LoadingSpinnerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    background: isDark ? "#1a1a2e" : "#ffffff",
    text: isDark ? "#a0a0a0" : "#666666",
    spinner: "#e94560",
  };

  const content = (
    <View style={styles.content}>
      <ActivityIndicator size={size} color={colors.spinner} />
      {message && <Text style={[styles.message, { color: colors.text }]}>{message}</Text>}
    </View>
  );

  if (fullScreen) {
    return <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>{content}</View>;
  }

  return content;
}

const styles = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  content: {
    alignItems: "center",
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
  },
});
