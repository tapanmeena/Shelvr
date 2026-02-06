import { Book } from "@/lib/types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BookCardProps {
  book: Book;
  onPress: () => void;
}

const BookCard = ({ book, onPress }: BookCardProps) => {
  const progressPercent = Math.round((book.progress || 0) * 100);
  const lastRead = book.lastReadtAt ? new Date(book.lastReadtAt).toLocaleDateString() : "Never";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.meta}>Last read: {lastRead}</Text>
        <Text style={styles.meta}>Progress: {progressPercent}%</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  meta: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
});

export default BookCard;
