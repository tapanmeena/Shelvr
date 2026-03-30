import { BookGrid } from "@/src/components/BookGrid";
import { EmptyState } from "@/src/components/EmptyState";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import * as repository from "@/src/database/repository";
import { useDatabase } from "@/src/database/useDatabase";
import { useThemeColors } from "@/src/stores/preferencesStore";
import { BookWithProgress } from "@/src/types";
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

  const [shelfName, setShelfName] = useState("");
  const [books, setBooks] = useState<BookWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadShelf = useCallback(async () => {
    if (!shelfId) return;
    try {
      setIsLoading(true);
      const shelf = await repository.getShelfById(db, shelfId);
      if (shelf) setShelfName(shelf.name);
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {shelfName}
        </Text>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
});
