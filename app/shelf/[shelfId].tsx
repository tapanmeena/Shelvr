import { BookGrid } from "@/src/components/BookGrid";
import { EmptyState } from "@/src/components/EmptyState";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import * as repository from "@/src/database/repository";
import { useDatabase } from "@/src/database/useDatabase";
import { useThemeColors } from "@/src/stores/preferencesStore";
import { BookWithProgress, Shelf } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLibraryStore } from "@/src/stores/libraryStore";

export default function ShelfDetailScreen() {
  const { shelfId } = useLocalSearchParams<{ shelfId: string }>();
  const colors = useThemeColors();
  const db = useDatabase();
  const progressMap = useLibraryStore((s) => s.progressMap);

  const [shelf, setShelf] = useState<Shelf | null>(null);
  const [books, setBooks] = useState<BookWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadShelf = useCallback(async () => {
    if (!shelfId) return;
    try {
      setIsLoading(true);
      const loadedShelf = await repository.getShelfById(db, shelfId);
      if (loadedShelf) setShelf(loadedShelf);
      const shelfBooks = await repository.getShelfBooks(db, shelfId);
      const withProgress: BookWithProgress[] = shelfBooks.map((book) => ({
        ...book,
        progress: progressMap[book.id],
      }));
      setBooks(withProgress);
    } finally {
      setIsLoading(false);
    }
  }, [db, shelfId, progressMap]);

  useEffect(() => {
    loadShelf();
  }, [loadShelf]);

  const handleBookPress = useCallback((book: BookWithProgress) => {
    router.push(`/reader/${book.id}`);
  }, []);

  const accentColor = shelf?.color ?? colors.accent;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: accentColor + "10" }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {shelf?.name ?? ""}
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            {books.length} {books.length === 1 ? "book" : "books"}
          </Text>
          {shelf?.description && (
            <Text
              style={[
                styles.headerDescription,
                { color: colors.textSecondary },
              ]}
              numberOfLines={2}
            >
              {shelf.description}
            </Text>
          )}
        </View>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <LoadingSpinner message="Loading shelf..." />
      ) : (
        <BookGrid
          books={books}
          onBookPress={handleBookPress}
          ListEmptyComponent={
            <EmptyState
              icon="book-outline"
              title="Empty Shelf"
              message="Add books to this shelf from your library"
              actionLabel="Go to Library"
              onAction={() => router.push("/(tabs)/library")}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerDescription: {
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
    lineHeight: 18,
  },
});
