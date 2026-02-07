import { BookGrid } from "@/src/components/BookGrid";
import { EmptyState } from "@/src/components/EmptyState";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { useDatabaseStatus } from "@/src/database/useDatabase";
import { useImportBook } from "@/src/features/library/hooks/useImportBook";
import useLibrary from "@/src/features/library/hooks/useLibrary";
import { BookWithProgress } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { isReady: dbReady, error: dbError } = useDatabaseStatus();

  const colors = {
    background: isDark ? "#1a1a2e" : "#ffffff",
    card: isDark ? "#16213e" : "#f8f9fa",
    text: isDark ? "#eaeaea" : "#1a1a2e",
    subtext: isDark ? "#a0a0a0" : "#666666",
    primary: "#e94560",
    border: isDark ? "#2d3748" : "#e2e8f0",
  };

  // Show loading while database initializes
  if (!dbReady) {
    if (dbError) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <EmptyState icon="warning-outline" title="Database Error" message={dbError.message} />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner fullScreen message="Loading library..." />
      </SafeAreaView>
    );
  }

  return <LibraryContent colors={colors} />;
}

interface LibraryContentProps {
  colors: {
    background: string;
    card: string;
    text: string;
    subtext: string;
    primary: string;
    border: string;
  };
}

const LibraryContent = ({ colors }: LibraryContentProps) => {
  const router = useRouter();

  const { isImporting, error: importError, importBook, clearError } = useImportBook();
  const { books, refresh, isLoading } = useLibrary();

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

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={handleImport}>
        <Text style={styles.addButtonText}>+ Open EPUB File</Text>
      </TouchableOpacity>

      {books.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No books yet.</Text>
          <Text style={styles.emptySubText}>Tap the button above to open an EPUB file</Text>
        </View>
      ) : (
        // <FlatList
        //   data={books}
        //   keyExtractor={(item) => item.id}
        //   renderItem={({ item }) => (
        //     // <TouchableOpacity
        //     //   style={{
        //     //     backgroundColor: "green",
        //     //     padding: 10,
        //     //     marginBottom: 5,
        //     //   }}
        //     //   onPress={() => {
        //     //     router.push({
        //     //       pathname: "/reader/[bookId]",
        //     //       params: { bookId: item.id },
        //     //     });
        //     //   }}
        //     // >
        //     //   <Text>{item.title}</Text>
        //     // </TouchableOpacity>
        //     <BookCard
        //   )}
        //   contentContainerStyle={styles.list}
        // />
        <BookGrid
          books={books}
          onBookPress={handleBookPress}
          // onBookLongPress={handleBookLongPress}
          refreshing={isLoading}
          onRefresh={refresh}
          ListEmptyComponent={
            <EmptyState
              icon="library-outline"
              title={"Your Library is Empty"}
              // title={searchQuery ? 'No Results' : 'Your Library is Empty'}
              message={"Import an ePUB file to get started"}
              // message={
              //   searchQuery
              //     ? `No books matching "${searchQuery}"`
              //     : 'Import an ePUB file to get started'
              // }
              action={
                <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleImport}>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Import Book</Text>
                </Pressable>
                // !searchQuery ? (
                //   <Pressable
                //     style={[styles.button, { backgroundColor: colors.primary }]}
                //     onPress={handleImport}
                //   >
                //     <Ionicons name="add" size={20} color="#fff" />
                //     <Text style={styles.buttonText}>Import Book</Text>
                //   </Pressable>
                // ) : undefined
              }
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  addButton: {
    margin: 16,
    padding: 16,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  list: { paddingHorizontal: 16 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#666" },
  emptySubText: { fontSize: 14, color: "#999", marginTop: 8 },

  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
