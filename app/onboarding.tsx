import { ThemePicker } from "@/src/components/ThemePicker";
import {
  usePreferencesStore,
  useThemeColors,
} from "@/src/stores/preferencesStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingPage {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const PAGES: OnboardingPage[] = [
  {
    key: "welcome",
    icon: "book",
    title: "Welcome to Shelvr",
    description:
      "Your personal reading space. Import ePUBs, track progress, and organize your books into shelves.",
  },
  {
    key: "theme",
    icon: "color-palette",
    title: "Make It Yours",
    description:
      "Choose a theme and accent color. You can always change these later in settings.",
  },
  {
    key: "import",
    icon: "library",
    title: "Start Reading",
    description: "Import your first book, or skip and explore the app.",
  },
];

export default function OnboardingScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const setHasCompletedOnboarding = usePreferencesStore(
    (s) => s.setHasCompletedOnboarding,
  );

  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentPage < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1 });
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const finishOnboarding = () => {
    setHasCompletedOnboarding(true);
    router.replace("/(tabs)");
  };

  const handleImport = () => {
    // Finish onboarding first — user can import from the Library tab
    // once the database is ready
    setHasCompletedOnboarding(true);
    router.replace("/(tabs)/library" as any);
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentPage(viewableItems[0].index);
      }
    },
  ).current;

  const renderPage = ({ item }: { item: OnboardingPage }) => (
    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
      {item.key === "welcome" && (
        <View style={styles.pageContent}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.accent + "20" },
            ]}
          >
            <Ionicons name={item.icon} size={48} color={colors.accent} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>
      )}

      {item.key === "theme" && (
        <View style={styles.pageContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
          <View style={styles.themePickerContainer}>
            <ThemePicker />
          </View>
        </View>
      )}

      {item.key === "import" && (
        <View style={styles.pageContent}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.accent + "20" },
            ]}
          >
            <Ionicons name={item.icon} size={48} color={colors.accent} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
          <Pressable
            style={[styles.importButton, { backgroundColor: colors.accent }]}
            onPress={handleImport}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.importButtonText}>Import Book</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Bottom controls */}
      <View style={styles.footer}>
        {/* Page dots */}
        <View style={styles.dots}>
          {PAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentPage ? colors.accent : colors.border,
                  width: index === currentPage ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {currentPage < PAGES.length - 1 ? (
            <>
              <Pressable onPress={handleSkip} style={styles.skipButton}>
                <Text
                  style={[styles.skipText, { color: colors.textSecondary }]}
                >
                  Skip
                </Text>
              </Pressable>
              <Pressable
                style={[styles.nextButton, { backgroundColor: colors.accent }]}
                onPress={handleNext}
              >
                <Text style={styles.nextText}>Next</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[
                styles.nextButton,
                styles.getStartedButton,
                { backgroundColor: colors.accent },
              ]}
              onPress={finishOnboarding}
            >
              <Text style={styles.nextText}>Get Started</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  pageContent: {
    alignItems: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  themePickerContainer: {
    marginTop: 32,
    width: "100%",
  },
  importButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 32,
  },
  importButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  getStartedButton: {
    flex: 1,
    justifyContent: "center",
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
