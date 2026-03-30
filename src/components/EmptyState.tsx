import { useThemeColors } from "@/src/stores/preferencesStore";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

export interface EmptyStateProps {
  icon?: IoniconsName;
  title: string;
  message?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "albums-outline",
  title,
  message,
  action,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const themeColors = useThemeColors();

  const colors = {
    text: themeColors.text,
    subtext: themeColors.textSecondary,
    icon: themeColors.textSecondary,
    primary: themeColors.accent,
  };

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.icon} style={styles.icon} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: colors.subtext }]}>
          {message}
        </Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
      {actionLabel && onAction && (
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onAction}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  action: {
    marginTop: 24,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
