import { updateBookProgress } from "@/lib/storage";
import { Book } from "@/lib/types";
import { useFileSystem } from "@/lib/useFileSystem";
import { Reader, useReader } from "@epubjs-react-native/core";
import { useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BookReader = ({ book }: { book: Book }) => {
  const router = useRouter();
  const { progress, isLoading, isRendering } = useReader();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  console.log({ progress, isLoading, isRendering });
  const debouncedSave = useCallback(
    (cfi: string, prog: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(async () => {
        updateBookProgress(book.id, cfi, prog).catch((err) => console.error("Failed to save progress", err));
      }, 1000);
    },
    [book.id],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{"< Back"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <Text style={styles.progressText}>{Math.round(progress ?? 0)}%</Text>
      </View>

      <View style={styles.readerContainer}>
        <Reader
          src={book.fileUri}
          fileSystem={useFileSystem}
          initialLocation={book.currentCfi ?? undefined}
          enableSwipe={true}
          onLocationChange={(totalLocations, currentLocation, prog) => {
            if (currentLocation?.start?.cfi) {
              debouncedSave(currentLocation.start.cfi, prog);
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  backButton: { fontSize: 16, color: "#007AFF" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "bold", marginHorizontal: 8 },
  progressText: { fontSize: 14, color: "#888" },
  readerContainer: { flex: 1 },
});

export default BookReader;
