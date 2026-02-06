import BookReader from "@/components/BookReader";
import { getBookById } from "@/lib/storage";
import { Book } from "@/lib/types";
import { ReaderProvider } from "@epubjs-react-native/core";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const ReaderScreen = () => {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!bookId) {
          setError("No book ID provided");
          return;
        }

        const found = await getBookById(bookId);
        if (!found) {
          setError("Book not found");
          return;
        }

        setBook(found);
      } catch (err) {
        console.error("Failed to load book", err);
        setError("Failed to load book");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Unknown error"}</Text>
      </View>
    );
  }

  return (
    <ReaderProvider>
      <BookReader book={book} />
    </ReaderProvider>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontSize: 16 },
});

export default ReaderScreen;
