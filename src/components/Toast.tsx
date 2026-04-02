import { useThemeColors } from "@/src/stores/preferencesStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";

type ToastVariant = "loading" | "success" | "error";

interface ToastProps {
  visible: boolean;
  variant: ToastVariant;
  message: string;
  onDismiss?: () => void;
}

const ICON_MAP: Record<ToastVariant, string> = {
  loading: "",
  success: "checkmark-circle",
  error: "warning",
};

export function Toast({ visible, variant, message, onDismiss }: ToastProps) {
  const colors = useThemeColors();
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  // Auto-dismiss success toasts
  useEffect(() => {
    if (visible && variant === "success") {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [visible, variant, onDismiss]);

  if (!visible) return null;

  const bgColor =
    variant === "error"
      ? colors.error + "1A"
      : variant === "success"
        ? colors.success + "1A"
        : colors.surface;

  const iconColor =
    variant === "error"
      ? colors.error
      : variant === "success"
        ? colors.success
        : colors.accent;

  const borderColor =
    variant === "error"
      ? colors.error + "40"
      : variant === "success"
        ? colors.success + "40"
        : colors.border;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor,
          transform: [{ translateY }],
        },
      ]}
    >
      {variant === "loading" ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <Ionicons name={ICON_MAP[variant] as any} size={20} color={iconColor} />
      )}
      <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
        {message}
      </Text>
      {variant === "error" && onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});
