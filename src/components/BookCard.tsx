import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import type { BookWithProgress } from "@/src/types";

interface BookCardProps {
  book: BookWithProgress;
  onPress: () => void;
  onLongPress?: () => void;
}

// Generate a consistent color based on the book title
function getPlaceholderColor(title: string): string {
  const colors = [
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#f43f5e", // Rose
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c55e", // Green
    "#14b8a6", // Teal
    "#06b6d4", // Cyan
    "#3b82f6", // Blue
  ];

  // Simple hash based on title
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  return colors[Math.abs(hash) % colors.length];
}

export function BookCard({ book, onPress, onLongPress }: BookCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    card: isDark ? "#16213e" : "#f8f9fa",
    text: isDark ? "#eaeaea" : "#1a1a2e",
    subtext: isDark ? "#a0a0a0" : "#666666",
    border: isDark ? "#2d3748" : "#e2e8f0",
    progress: "#e94560",
    komgaBadge: "#0ea5e9", // Sky blue for Komga
  };

  const progressPercentage = book.progress?.percentage ?? 0;
  const hasProgress = progressPercentage > 0;
  const isKomgaBook = book.source === "komga";

  return (
    <Pressable
      style={({ pressed }) => [styles.container, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.coverContainer}>
        {book.coverPath ? (
          <Image source={{ uri: `file://${book.coverPath}` }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholderCover, { backgroundColor: getPlaceholderColor(book.title) }]}>
            <View style={styles.placeholderContent}>
              <Ionicons name="book-outline" size={28} color="rgba(255,255,255,0.7)" />
              <Text style={styles.placeholderTitle} numberOfLines={3}>
                {book.title}
              </Text>
              {book.authors && book.authors.length > 0 && (
                <Text style={styles.placeholderAuthor} numberOfLines={1}>
                  {book.authors[0]}
                </Text>
              )}
            </View>
          </View>
        )}
        {/* Komga badge */}
        {isKomgaBook && (
          <View style={[styles.komgaBadge, { backgroundColor: colors.komgaBadge }]}>
            <Ionicons name="cloud-download-outline" size={12} color="#fff" />
          </View>
        )}
        {hasProgress && (
          <View style={styles.progressOverlay}>
            <View style={[styles.progressBar, { width: `${progressPercentage * 100}%`, backgroundColor: colors.progress }]} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        {book.authors && book.authors.length > 0 && (
          <Text style={[styles.author, { color: colors.subtext }]} numberOfLines={1}>
            {book.authors.join(", ")}
          </Text>
        )}
        {hasProgress && <Text style={[styles.progress, { color: colors.progress }]}>{Math.round(progressPercentage * 100)}%</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  coverContainer: {
    aspectRatio: 2 / 3,
    width: "100%",
    position: "relative",
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  placeholderCover: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    width: "100%",
  },
  placeholderTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  placeholderAuthor: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
    fontStyle: "italic",
  },
  progressOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  progressBar: {
    height: "100%",
  },
  komgaBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    borderRadius: 10,
    padding: 4,
  },
  info: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    marginBottom: 4,
  },
  progress: {
    fontSize: 11,
    fontWeight: "500",
  },
});
