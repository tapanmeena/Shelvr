import { ThemePicker } from "@/src/components/ThemePicker";
import {
  usePreferencesStore,
  useThemeColors,
} from "@/src/stores/preferencesStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const reopenLastBook = usePreferencesStore((s) => s.reopenLastBookOnLaunch);
  const setReopenLastBook = usePreferencesStore(
    (s) => s.setReopenLastBookOnLaunch,
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Settings
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Appearance
        </Text>
        <ThemePicker showAccents />

        <Text
          style={[
            styles.sectionTitle,
            styles.sectionTitleSpaced,
            { color: colors.textSecondary },
          ]}
        >
          Behavior
        </Text>

        <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Reopen last book on launch
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: colors.textSecondary },
              ]}
            >
              Automatically open where you left off
            </Text>
          </View>
          <Switch
            value={reopenLastBook}
            onValueChange={setReopenLastBook}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </View>

        <Text style={[styles.tip, { color: colors.textSecondary }]}>
          Font and reading settings can be changed while reading a book.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionTitleSpaced: {
    marginTop: 28,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  tip: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 24,
    fontStyle: "italic",
  },
});
