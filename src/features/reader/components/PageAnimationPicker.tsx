import {
  usePreferencesStore,
  useThemeColors,
} from "@/src/stores/preferencesStore";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { PageAnimation } from "@/src/types";

const OPTIONS: { id: PageAnimation; label: string }[] = [
  { id: "none", label: "None" },
  { id: "slide", label: "Slide" },
  { id: "fade", label: "Fade" },
];

export function PageAnimationPicker() {
  const colors = useThemeColors();
  const current = usePreferencesStore((s) => s.pageAnimation);
  const setPageAnimation = usePreferencesStore((s) => s.setPageAnimation);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Page Animation</Text>
      <View style={styles.row}>
        {OPTIONS.map((opt) => {
          const isSelected = current === opt.id;
          return (
            <Pressable
              key={opt.id}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected
                    ? colors.accent
                    : colors.background,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setPageAnimation(opt.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? "#fff" : colors.text },
                ]}
              >
                {opt.label}
              </Text>
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
  row: {
    flexDirection: "row",
    gap: 10,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
