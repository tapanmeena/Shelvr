import { BookGrid } from "@/src/components/BookGrid";
import { EmptyState } from "@/src/components/EmptyState";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { useDatabaseStatus } from "@/src/database/useDatabase";
import { useBookSearch } from "@/src/features/library/hooks/useBookSearch";
import useLibrary from "@/src/features/library/hooks/useLibrary";
import { useThemeColors } from "@/src/stores/preferencesStore";
import { BookWithProgress } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterStatus = "all" | "reading" | "unread" | "finished";
type SortBy = "recent" | "title" | "author";

const FILTER_OPTIONS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "reading", label: "Reading" },
  { key: "unread", label: "Unread" },
  { key: "finished", label: "Finished" },
];

const SORT_OPTIONS: { key: SortBy; label: string }[] = [
  { key: "recent", label: "Recent" },
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
];

export default function SearchScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { isReady: dbReady } = useDatabaseStatus();
  const { books, isLoading } = useLibrary();
  const { searchQuery, setSearchQuery, filteredBooks, clearSearch } =
    useBookSearch(books);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  const processedBooks = useMemo(() => {
    let result = filteredBooks;

    // Filter by status
    if (filterStatus === "reading") {
      result = result.filter(
        (b) =>
          b.progress &&
          b.progress.percentage > 0 &&
          b.progress.percentage < 1.0,
      );
    } else if (filterStatus === "unread") {
      result = result.filter((b) => !b.progress || b.progress.percentage === 0);
    } else if (filterStatus === "finished") {
      result = result.filter((b) => b.progress && b.progress.percentage >= 1.0);
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "author") {
        const aAuthor = a.authors?.[0] ?? "";
        const bAuthor = b.authors?.[0] ?? "";
        return aAuthor.localeCompare(bAuthor);
      }
      // recent — sort by updatedAt desc
      return b.updatedAt - a.updatedAt;
    });

    return result;
  }, [filteredBooks, filterStatus, sortBy]);

  const handleBookPress = useCallback(
    (book: BookWithProgress) => {
      router.push(`/reader/${book.id}`);
    },
    [router],
  );

  if (!dbReady) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Search Input */}
      <View style={styles.searchHeader}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search books..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={clearSearch}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.chipSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {FILTER_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    filterStatus === opt.key ? colors.accent : colors.surface,
                  borderColor:
                    filterStatus === opt.key ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setFilterStatus(opt.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: filterStatus === opt.key ? "#fff" : colors.text,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}

          <View
            style={[styles.chipDivider, { backgroundColor: colors.border }]}
          />

          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    sortBy === opt.key ? colors.accent : colors.surface,
                  borderColor:
                    sortBy === opt.key ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setSortBy(opt.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: sortBy === opt.key ? "#fff" : colors.text,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner message="Loading..." />
      ) : processedBooks.length > 0 ? (
        <BookGrid books={processedBooks} onBookPress={handleBookPress} />
      ) : (
        <EmptyState
          icon="search-outline"
          title={searchQuery ? "No Results" : "Search Your Library"}
          message={
            searchQuery
              ? `No books matching "${searchQuery}"`
              : `${books.length} books available to search`
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 2,
  },
  chipSection: {
    paddingBottom: 8,
  },
  chipRow: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
});
