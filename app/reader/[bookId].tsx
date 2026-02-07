import { EmptyState } from "@/src/components/EmptyState";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { ProgressBar } from "@/src/components/ProgressBar";
import { Reader } from "@/src/features/reader/components/Reader";
import { useReader } from "@/src/features/reader/hooks/useReader";
import { readerLog } from "@/src/utils/logger";
import { ReaderProvider } from "@epubjs-react-native/core";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { AppState, Modal, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ReaderScreen = () => {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [showHeader, setShowHeader] = useState(true);
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tocItems] = useState<{ id: string; herf: string; label: string }[]>([]);

  const { book, isLoading, error, initialLocation, initialLocations, currentProgress, currentChapter, saveProgress, handleLocationsReady } =
    useReader(bookId || "");

  const lastCfiRef = useRef("");
  const appState = useRef(AppState.currentState);

  const colors = {
    background: isDark ? "#1a1a2e" : "#ffffff",
    text: isDark ? "#eaeaea" : "#1a1a2e",
    subtext: isDark ? "#a0a0a0" : "#666666",
    primary: "#e94560",
    headerBg: isDark ? "rgba(26, 26, 46, 0.95)" : "rgba(255, 255, 255, 0.95)",
  };

  const handleClose = () => {
    router.back();
  };

  const handleLocationChange = useCallback(
    (cfi: string, progress: number | null, chapter?: string) => {
      saveProgress(cfi, progress, undefined, chapter);
      lastCfiRef.current = cfi;
    },
    [saveProgress],
  );

  const handleReaderTap = useCallback(() => {
    setShowHeader((prev) => !prev);
  }, []);

  const handleReady = useCallback(() => {
    readerLog.info("Reader ready");
  }, []);

  const handleError = useCallback((reason: string) => {
    readerLog.error("Reader error:", reason);
  }, []);

  const handleOpenToc = () => {
    setShowToc(true);
  };

  const handleSelectChapter = (_href: string) => {
    setShowToc(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner message="Loading book..." />
      </SafeAreaView>
    );
  }
  if (!bookId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState icon="alert-circle" title="Book Not Found" message="No book ID was provided" actionLabel="Go Back" onAction={handleClose} />
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState icon="alert-circle" title="Error Loading Book" message={error || "Book not found"} actionLabel="Go Back" onAction={handleClose} />
      </SafeAreaView>
    );
  }
  return (
    <ReaderProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar hidden={!showHeader} />

        {/* Reader Content */}
        <Pressable style={styles.readerContainer} onPress={handleReaderTap}>
          <Reader
            bookPath={book.filePath}
            initialLocation={initialLocation}
            initialLocations={initialLocations}
            onLocationChange={handleLocationChange}
            onLocationsReady={handleLocationsReady}
            onReady={handleReady}
            onError={handleError}
          />
        </Pressable>
        {/* Header Overlay */}
        {showHeader && (
          <SafeAreaView style={[styles.headerOverlay, { backgroundColor: colors.headerBg }]} edges={["top"]}>
            <View style={styles.header}>
              <Pressable onPress={handleClose} style={styles.headerButton}>
                <Ionicons name="close" size={28} color={colors.text} />
              </Pressable>

              <View style={styles.headerCenter}>
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                  {book.title}
                </Text>
                {currentChapter && (
                  <Text style={[styles.headerSubtitle, { color: colors.subtext }]} numberOfLines={1}>
                    {currentChapter}
                  </Text>
                )}
              </View>

              <View style={styles.headerActions}>
                <Pressable style={styles.headerButton} onPress={handleOpenToc}>
                  <Ionicons name="list" size={24} color={colors.text} />
                </Pressable>
                <Pressable style={styles.headerButton} onPress={() => setShowSettings(true)}>
                  <Ionicons name="settings-outline" size={24} color={colors.text} />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        )}

        {/* Footer Overlay with Progress */}
        {showHeader && (
          <SafeAreaView style={[styles.footerOverlay, { backgroundColor: colors.headerBg }]} edges={["bottom"]}>
            <View style={styles.footer}>
              <ProgressBar progress={currentProgress * 100} />
              <Text style={[styles.progressText, { color: colors.subtext }]}>{(currentProgress * 100).toFixed(2)}% complete</Text>
            </View>
          </SafeAreaView>
        )}

        {/* Table of Contents Modal */}
        <Modal visible={showToc} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowToc(false)}>
          {/* <TableOfContents
            items={tocItems}
            currentChapter={currentChapter}
            onSelectChapter={handleSelectChapter}
            onClose={() => setShowToc(false)}
          /> */}
          <Text>Random Table of contents modal</Text>
        </Modal>

        {/* Reader Settings Modal */}
        <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowSettings(false)}>
          {/* <ReaderSettings onClose={() => setShowSettings(false)} /> */}
          <Text>Reader settings modal</Text>
        </Modal>
      </View>
    </ReaderProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  readerContainer: {
    flex: 1,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
  },
  footerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});

export default ReaderScreen;
