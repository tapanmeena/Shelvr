import BookCard from "@/components/BookCard";
import { importEpub } from "@/lib/fileManager";
import { addBook, getAllBooks } from "@/lib/storage";
import { Book } from "@/lib/types";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LibraryScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, []),
  );

  const loadBooks = async () => {
    try {
      const stored = await getAllBooks();
      setBooks(stored);
    } catch (error) {
      console.error("Failed to load books", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickBook = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/epub+zip",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      if (!asset.name.toLowerCase().endsWith(".epub")) {
        Alert.alert("Invalid file", "Please select a valid EPUB file.");
        return;
      }

      const book = await importEpub(asset.uri, asset.name);
      const updatedBooks = await addBook(book);
      setBooks(updatedBooks);
    } catch (error) {
      console.error("Failed to import book", error);
      Alert.alert("Import Error", "An error occurred while importing the book.");
    }
  };

  const handleOpenBook = (bookId: string) => {
    router.push({
      pathname: "/reader/[bookId]",
      params: { bookId },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={handlePickBook}>
        <Text style={styles.addButtonText}>+ Open EPUB File</Text>
      </TouchableOpacity>

      {books.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No books yet.</Text>
          <Text style={styles.emptySubText}>Tap the button above to open an EPUB file</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BookCard book={item} onPress={() => handleOpenBook(item.id)} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

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
});
