import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { ThemePicker } from "@/src/components/ThemePicker";
import { FontPicker } from "./FontPicker";
import { FontSizeSlider } from "./FontSizeSlider";
import { LineSpacingSlider } from "./LineSpacingSlider";

interface ReaderSettingsProps {
  onClose: () => void;
}

export function ReaderSettings({ onClose }: ReaderSettingsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    background: isDark ? "#1a1a2e" : "#ffffff",
    text: isDark ? "#eaeaea" : "#1a1a2e",
    border: isDark ? "#2d3748" : "#e2e8f0",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Reading Settings</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ThemePicker />
        <FontPicker />
        <FontSizeSlider />
        <LineSpacingSlider />

        <View style={styles.tip}>
          <Ionicons name="information-circle-outline" size={20} color={colors.text} />
          <Text style={[styles.tipText, { color: colors.text }]}>Settings are applied instantly and saved automatically</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  tip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
