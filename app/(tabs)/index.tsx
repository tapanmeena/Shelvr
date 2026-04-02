import { useThemeColors } from "@/src/stores/preferencesStore";
import { useLibraryStore } from "@/src/stores/libraryStore";
import { useDatabaseStatus } from "@/src/database/useDatabase";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { EmptyState } from "@/src/components/EmptyState";
import { useRouter } from "expo-router";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BookWithProgress } from "@/src/types";
import { useMemo } from "react";

export default function HomeScreen() {
  const colors = useThemeColors();
  const { isReady: dbReady } = useDatabaseStatus();
  const router = useRouter();

  const books = useLibraryStore((s) => s.books);
  const progressMap = useLibraryStore((s) => s.progressMap);

  const booksWithProgress = useMemo<BookWithProgress[]>(
    () =>
      books.map((book) => ({
        ...book,
        progress: progressMap[book.id],
      })),
    [books, progressMap],
  );

  const lastOpenedBookId = useMemo(() => {
    const entries = Object.entries(progressMap);
    if (entries.length === 0) return null;
    const sorted = entries.sort(
      (a, b) => (b[1].lastReadAt ?? 0) - (a[1].lastReadAt ?? 0),
    );
    return sorted[0][0];
  }, [progressMap]);

  const continueBook = useMemo(() => {
    if (!lastOpenedBookId) return null;
    const book =
      booksWithProgress.find((b) => b.id === lastOpenedBookId) ?? null;
    if (book?.progress && book.progress.percentage >= 1.0) return null;
    return book;
  }, [lastOpenedBookId, booksWithProgress]);

  const recentlyRead = useMemo(() => {
    return booksWithProgress
      .filter((b) => b.progress && b.progress.percentage > 0)
      .sort(
        (a, b) => (b.progress?.lastReadAt ?? 0) - (a.progress?.lastReadAt ?? 0),
      )
      .slice(0, 10);
  }, [booksWithProgress]);

  const stats = useMemo(() => {
    const finished = booksWithProgress.filter(
      (b) => b.progress && b.progress.percentage >= 1.0,
    ).length;
    const reading = booksWithProgress.filter(
      (b) =>
        b.progress && b.progress.percentage > 0 && b.progress.percentage < 1.0,
    ).length;
    return { finished, reading, total: booksWithProgress.length };
  }, [booksWithProgress]);

  if (!dbReady) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LoadingSpinner fullScreen message="Loading..." />
      </SafeAreaView>
    );
  }

  const handleBookPress = (book: BookWithProgress) => {
    router.push(`/reader/${book.id}`);
  };

  const PLACEHOLDER_COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
    "#3b82f6",
  ];

  const getPlaceholderColor = (title: string) => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length];
  };

  const renderSmallBookCard = ({ item }: { item: BookWithProgress }) => (
    <Pressable style={styles.smallCard} onPress={() => handleBookPress(item)}>
      {item.coverPath ? (
        <Image
          source={{ uri: `file://${item.coverPath}` }}
          style={[styles.smallCover, { backgroundColor: colors.surface }]}
        />
      ) : (
        <View
          style={[
            styles.smallCover,
            { backgroundColor: getPlaceholderColor(item.title) },
          ]}
        >
          <Ionicons name="book" size={20} color="rgba(255,255,255,0.7)" />
        </View>
      )}
      <Text
        style={[styles.smallTitle, { color: colors.text }]}
        numberOfLines={2}
      >
        {item.title}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <FlatList
        data={[]}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Shelvr
              </Text>
              <Pressable
                onPress={() => router.push("/settings" as any)}
                hitSlop={8}
              >
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color={colors.text}
                />
              </Pressable>
            </View>

            {/* Continue Reading */}
            {continueBook && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Continue Reading
                </Text>
                <Pressable
                  style={[styles.heroCard, { backgroundColor: colors.surface }]}
                  onPress={() => handleBookPress(continueBook)}
                >
                  <View style={styles.heroContent}>
                    {continueBook.coverPath ? (
                      <Image
                        source={{ uri: `file://${continueBook.coverPath}` }}
                        style={styles.heroCover}
                      />
                    ) : (
                      <View
                        style={[
                          styles.heroCover,
                          {
                            backgroundColor: getPlaceholderColor(
                              continueBook.title,
                            ),
                            justifyContent: "center",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <Ionicons
                          name="book"
                          size={28}
                          color="rgba(255,255,255,0.7)"
                        />
                      </View>
                    )}
                    <View style={styles.heroInfo}>
                      <Text
                        style={[styles.heroTitle, { color: colors.text }]}
                        numberOfLines={2}
                      >
                        {continueBook.title}
                      </Text>
                      {continueBook.authors &&
                        continueBook.authors.length > 0 && (
                          <Text
                            style={[
                              styles.heroAuthor,
                              { color: colors.textSecondary },
                            ]}
                            numberOfLines={1}
                          >
                            {continueBook.authors.join(", ")}
                          </Text>
                        )}
                      {continueBook.progress && (
                        <View style={styles.heroProgress}>
                          <View
                            style={[
                              styles.progressBar,
                              { backgroundColor: colors.border },
                            ]}
                          >
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  backgroundColor: colors.accent,
                                  width: `${Math.round(continueBook.progress.percentage * 100)}%`,
                                },
                              ]}
                            />
                          </View>
                          <Text
                            style={[
                              styles.progressText,
                              { color: colors.accent },
                            ]}
                          >
                            {Math.round(continueBook.progress.percentage * 100)}
                            %
                          </Text>
                        </View>
                      )}
                      {continueBook.progress?.chapterTitle && (
                        <Text
                          style={[
                            styles.heroChapter,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {continueBook.progress.chapterTitle}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              </View>
            )}

            {/* Stats */}
            {booksWithProgress.length > 0 && (
              <View style={styles.statsRow}>
                <View
                  style={[styles.statCard, { backgroundColor: colors.surface }]}
                >
                  <Text style={[styles.statNumber, { color: colors.accent }]}>
                    {stats.total}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Total Books
                  </Text>
                </View>
                <View
                  style={[styles.statCard, { backgroundColor: colors.surface }]}
                >
                  <Text style={[styles.statNumber, { color: colors.accent }]}>
                    {stats.reading}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Reading
                  </Text>
                </View>
                <View
                  style={[styles.statCard, { backgroundColor: colors.surface }]}
                >
                  <Text style={[styles.statNumber, { color: colors.accent }]}>
                    {stats.finished}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Finished
                  </Text>
                </View>
              </View>
            )}

            {/* Recently Read */}
            {recentlyRead.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Recently Read
                </Text>
                <FlatList
                  data={recentlyRead}
                  renderItem={renderSmallBookCard}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                />
              </View>
            )}

            {/* Empty state */}
            {booksWithProgress.length === 0 && (
              <View style={styles.emptyContainer}>
                <EmptyState
                  icon="book-outline"
                  title="Welcome to Shelvr"
                  message="Import your first ePUB to start reading"
                  actionLabel="Go to Library"
                  onAction={() => router.push("/(tabs)/library")}
                />
              </View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  // Hero card
  heroCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  heroContent: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  heroCover: {
    width: 90,
    height: 135,
    borderRadius: 8,
  },
  heroInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  heroAuthor: {
    fontSize: 14,
    marginTop: 2,
  },
  heroProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
  },
  heroChapter: {
    fontSize: 12,
    marginTop: 4,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  // Small cards (horizontal)
  horizontalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  smallCard: {
    width: 100,
  },
  smallCover: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 6,
  },
  smallTitle: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  emptyContainer: {
    paddingTop: 60,
  },
});
