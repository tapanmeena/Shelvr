import { BookGrid } from "@/src/components/BookGrid";
import { EmptyState } from "@/src/components/EmptyState";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { Toast } from "@/src/components/Toast";
import * as repository from "@/src/database/repository";
import { useDatabase, useDatabaseStatus } from "@/src/database/useDatabase";
import { DeleteBookModal } from "@/src/features/library/components/DeleteBookModal";
import { useBookSearch } from "@/src/features/library/hooks/useBookSearch";
import { useImportBook } from "@/src/features/library/hooks/useImportBook";
import useLibrary from "@/src/features/library/hooks/useLibrary";
import { AddToShelfSheet } from "@/src/features/shelves/components/AddToShelfSheet";
import { useShelves } from "@/src/features/shelves/hooks/useShelves";
import { useLibraryStore } from "@/src/stores/libraryStore";
import { useThemeColors } from "@/src/stores/preferencesStore";
import { BookWithProgress } from "@/src/types";
import { formatFileSize } from "@/src/utils";
import { libraryLog } from "@/src/utils/logger";
import { Ionicons } from "@expo/vector-icons";
import { File } from "expo-file-system";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
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

export default function LibraryScreen() {
  const colors = useThemeColors();
  const { isReady: dbReady, error: dbError } = useDatabaseStatus();

  if (!dbReady) {
    if (dbError) {
      return (
        <SafeAreaView
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <EmptyState
            icon="warning-outline"
            title="Database Error"
            message={dbError.message}
          />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LoadingSpinner fullScreen message="Loading library..." />
      </SafeAreaView>
    );
  }

  return <LibraryContent />;
}

const LibraryContent = () => {
  const router = useRouter();
  const colors = useThemeColors();
  const [showSearch, setShowSearch] = useState(false);

  const { books, isLoading, error, refresh } = useLibrary();
  const {
    isImporting,
    importingBook,
    error: importError,
    importBook,
    clearError,
  } = useImportBook();
  const { searchQuery, setSearchQuery, filteredBooks, clearSearch } =
    useBookSearch(books);

  // Filter & sort state
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  const processedBooks = useMemo(() => {
    let result = filteredBooks;

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

    result = [...result].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "author") {
        const aAuthor = a.authors?.[0] ?? "";
        const bAuthor = b.authors?.[0] ?? "";
        return aAuthor.localeCompare(bAuthor);
      }
      return b.updatedAt - a.updatedAt;
    });

    return result;
  }, [filteredBooks, filterStatus, sortBy]);

  // Delete modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<BookWithProgress | null>(
    null,
  );

  const db = useDatabase();
  const removeBook = useLibraryStore((state) => state.removeBook);
  const { addBookToShelf, removeBookFromShelf } = useShelves();

  // Add to shelf state
  const [shelfSheetVisible, setShelfSheetVisible] = useState(false);
  const [bookForShelf, setBookForShelf] = useState<BookWithProgress | null>(
    null,
  );

  const handleImport = async () => {
    clearError();
    const success = await importBook();
    if (success) {
      refresh();
    }
  };

  const handleBookPress = (book: BookWithProgress) => {
    router.push(`/reader/${book.id}`);
  };

  const handleBookLongPress = (book: BookWithProgress) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "Cancel",
            "Open Book",
            "Book Info",
            "Add to Shelf",
            "Remove from Library",
          ],
          destructiveButtonIndex: 4,
          cancelButtonIndex: 0,
          title: book.title,
          message: book.authors?.join(", ") || undefined,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleBookPress(book);
          } else if (buttonIndex === 2) {
            showBookInfo(book);
          } else if (buttonIndex === 3) {
            setBookForShelf(book);
            setShelfSheetVisible(true);
          } else if (buttonIndex === 4) {
            setBookToDelete(book);
            setDeleteModalVisible(true);
          }
        },
      );
    } else {
      Alert.alert(
        book.title,
        `By: ${book.authors?.join(", ") || "Unknown Author"}`,
        [
          { text: "Open", onPress: () => handleBookPress(book) },
          { text: "Info", onPress: () => showBookInfo(book) },
          {
            text: "Add to Shelf",
            onPress: () => {
              setBookForShelf(book);
              setShelfSheetVisible(true);
            },
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              setBookToDelete(book);
              setDeleteModalVisible(true);
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    }
  };

  const showBookInfo = (book: BookWithProgress) => {
    const progress = book.progress?.percentage
      ? `${Math.round(book.progress.percentage * 100)}% complete`
      : "Not started";
    const source =
      book.source === "komga" ? "Downloaded from Komga" : "Imported locally";

    Alert.alert(
      book.title,
      [
        book.authors?.join(", ") || "Unknown Author",
        "",
        progress,
        source,
        book.fileSize ? `Size: ${formatFileSize(book.fileSize)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  };

  const handleDeleteBook = async (deleteFile: boolean) => {
    if (!bookToDelete) return;

    try {
      await repository.deleteBook(db, bookToDelete.id);
      removeBook(bookToDelete.id);

      if (deleteFile && bookToDelete.filePath) {
        try {
          const file = new File(bookToDelete.filePath);
          if (file.exists) {
            await file.delete();
          }
        } catch (fileError) {
          libraryLog.warn("Failed to delete file:", fileError);
        }
      }

      setDeleteModalVisible(false);
      setBookToDelete(null);
    } catch (err) {
      libraryLog.error("Delete error:", err);
      Alert.alert("Error", "Failed to remove book from library");
    }
  };

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <EmptyState
          icon="alert-circle-outline"
          title="Error Loading Library"
          message={error}
          action={
            <Pressable
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={refresh}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </Pressable>
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Library
        </Text>
        {books.length > 0 && (
          <Pressable onPress={() => setShowSearch(!showSearch)} hitSlop={8}>
            <Ionicons
              name={showSearch ? "close" : "search-outline"}
              size={24}
              color={colors.text}
            />
          </Pressable>
        )}
      </View>

      {/* Search Bar */}
      {showSearch && (
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
            placeholder="Search by title or author..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
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
      )}

      {/* Filter & Sort Chips */}
      {books.length > 0 && (
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
      )}

      {/* Book Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading books..." />
      ) : (
        <BookGrid
          books={processedBooks}
          importingBook={importingBook}
          onBookPress={handleBookPress}
          onBookLongPress={handleBookLongPress}
          refreshing={isLoading}
          onRefresh={refresh}
          ListEmptyComponent={
            <EmptyState
              icon="library-outline"
              title={searchQuery ? "No Results" : "Your Library is Empty"}
              message={
                searchQuery
                  ? `No books matching "${searchQuery}"`
                  : "Import an ePUB file to get started"
              }
              action={
                !searchQuery ? (
                  <Pressable
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleImport}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Import Book</Text>
                  </Pressable>
                ) : undefined
              }
            />
          }
        />
      )}

      {/* FAB - Import Button */}
      <Pressable
        style={[
          styles.fab,
          { backgroundColor: colors.primary },
          isImporting && styles.fabDisabled,
        ]}
        onPress={handleImport}
        disabled={isImporting}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Import Error Toast */}
      <Toast
        visible={!!importError}
        variant="error"
        message={importError ?? ""}
        onDismiss={() => {
          clearError();
        }}
      />

      {/* Delete Book Modal */}
      <DeleteBookModal
        visible={deleteModalVisible}
        book={bookToDelete}
        onConfirm={handleDeleteBook}
        onCancel={() => {
          setDeleteModalVisible(false);
          setBookToDelete(null);
        }}
      />

      {/* Add to Shelf Sheet */}
      {bookForShelf && (
        <AddToShelfSheet
          visible={shelfSheetVisible}
          bookId={bookForShelf.id}
          bookTitle={bookForShelf.title}
          onAddToShelf={addBookToShelf}
          onRemoveFromShelf={removeBookFromShelf}
          onClose={() => {
            setShelfSheetVisible(false);
            setBookForShelf(null);
          }}
        />
      )}
    </SafeAreaView>
  );
};

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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
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
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabDisabled: {
    opacity: 0.7,
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
