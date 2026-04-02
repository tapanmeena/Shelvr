import { EmptyState, LoadingSpinner, ProgressBar } from "@/src/components";
import {
  Reader,
  ReaderSettings,
  TableOfContents,
} from "@/src/features/reader/components";
import { useReader } from "@/src/features/reader/hooks/useReader";
import {
  usePreferencesStore,
  useThemeColors,
} from "@/src/stores/preferencesStore";
import { readerLog } from "@/src/utils/logger";
import {
  ReaderProvider,
  useReader as useEpubReader,
} from "@epubjs-react-native/core";
import { useKeepAwake } from "expo-keep-awake";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  AppState,
  Easing,
  type GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CHROME_AUTO_HIDE_DELAY_MS = 10;
const TAP_ZONE_HINT_DURATION_MS = 10;

const ReaderScreen = () => {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const themeColors = useThemeColors();
  const currentTheme = usePreferencesStore((s) => s.theme);
  const statusBarStyle =
    currentTheme === "dark" || currentTheme === "midnight" ? "light" : "dark";

  const [showHeader, setShowHeader] = useState(true);
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [readerError, setReaderError] = useState<string | null>(null);
  const [readerInstanceKey, setReaderInstanceKey] = useState(0);
  const [readerReady, setReaderReady] = useState(false);

  // true = initial open (should auto-hide), false = user toggled (stay until dismissed)
  const autoHideRef = useRef(true);
  const readerReadyRef = useRef(false);

  const {
    book,
    isLoading,
    error,
    initialLocation,
    initialLocations,
    currentProgress,
    currentChapter,
    currentChapterHref,
    saveProgress,
    flushProgress,
    handleLocationsReady,
  } = useReader(bookId || "");

  const colors = {
    background: themeColors.background,
    text: themeColors.text,
    subtext: themeColors.textSecondary,
    primary: themeColors.accent,
    headerBg: themeColors.background,
  };

  const handleClose = async () => {
    await flushProgress();
    router.back();
  };

  const handleLocationChange = useCallback(
    (
      cfi: string,
      progress: number | null,
      chapterHref?: string,
      chapterTitle?: string,
    ) => {
      saveProgress(cfi, progress, chapterHref, chapterTitle);
    },
    [saveProgress],
  );

  const handleReaderTap = useCallback(() => {
    autoHideRef.current = false;
    setShowHeader((prev) => !prev);
  }, []);

  const handleReady = useCallback(() => {
    readerReadyRef.current = true;
    setReaderReady(true);
    setReaderError(null);
    readerLog.info("Reader ready");
  }, []);

  const handleError = useCallback((reason: string) => {
    readerLog.error("Reader error:", reason);
    if (!readerReadyRef.current) {
      readerLog.info("Ignoring error before reader is ready");
      return;
    }
    setReaderError(reason || "This section could not be rendered.");
    setShowHeader(true);
  }, []);

  const handleRetryReader = useCallback(() => {
    readerReadyRef.current = false;
    setReaderReady(false);
    setReaderError(null);
    setReaderInstanceKey((currentKey) => currentKey + 1);
  }, []);

  const handleOpenToc = () => {
    setShowToc(true);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") {
        void flushProgress();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [flushProgress]);

  useEffect(() => {
    if (
      !showHeader ||
      !autoHideRef.current ||
      showToc ||
      showSettings ||
      readerError
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      setShowHeader(false);
      autoHideRef.current = false;
    }, CHROME_AUTO_HIDE_DELAY_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [showHeader, showToc, showSettings, readerError]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LoadingSpinner message="Loading book..." />
      </SafeAreaView>
    );
  }
  if (!bookId) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <EmptyState
          icon="alert-circle"
          title="Book Not Found"
          message="No book ID was provided"
          actionLabel="Go Back"
          onAction={handleClose}
        />
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <EmptyState
          icon="alert-circle"
          title="Error Loading Book"
          message={error || "Book not found"}
          actionLabel="Go Back"
          onAction={handleClose}
        />
      </SafeAreaView>
    );
  }
  return (
    <ReaderProvider>
      <ReaderContent
        book={book}
        initialLocation={initialLocation}
        initialLocations={initialLocations}
        showHeader={showHeader}
        showToc={showToc}
        showSettings={showSettings}
        currentProgress={currentProgress}
        currentChapter={currentChapter}
        currentChapterHref={currentChapterHref}
        readerError={readerError}
        readerInstanceKey={readerInstanceKey}
        readerReady={readerReady}
        statusBarStyle={statusBarStyle}
        colors={colors}
        onReaderTap={handleReaderTap}
        onClose={handleClose}
        onOpenToc={handleOpenToc}
        onCloseToc={() => setShowToc(false)}
        onLocationChange={handleLocationChange}
        onLocationsReady={handleLocationsReady}
        onReady={handleReady}
        onError={handleError}
        onRetryReader={handleRetryReader}
        onShowSettings={() => setShowSettings(true)}
        onCloseSettings={() => setShowSettings(false)}
      />
    </ReaderProvider>
  );
};

interface ReaderContentProps {
  book: NonNullable<ReturnType<typeof useReader>["book"]>;
  initialLocation?: string;
  initialLocations?: string[];
  showHeader: boolean;
  showToc: boolean;
  showSettings: boolean;
  currentProgress: number;
  currentChapter?: string;
  currentChapterHref?: string;
  readerError: string | null;
  readerInstanceKey: number;
  readerReady: boolean;
  statusBarStyle: "light" | "dark";
  colors: Record<string, string>;
  onReaderTap: () => void;
  onClose: () => void | Promise<void>;
  onOpenToc: () => void;
  onCloseToc: () => void;
  onLocationChange: (
    cfi: string,
    progress: number | null,
    chapterHref?: string,
    chapterTitle?: string,
  ) => void;
  onLocationsReady: (epubKey: string, locations: string[]) => void;
  onReady: () => void;
  onError: (reason: string) => void;
  onRetryReader: () => void;
  onShowSettings: () => void;
  onCloseSettings: () => void;
}

/** Tap zone hint overlay — shows left/center/right regions briefly */
function TapZoneHint({
  visible,
  colors,
}: {
  visible: boolean;
  colors: Record<string, string>;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(TAP_ZONE_HINT_DURATION_MS - 600),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.tapZoneOverlay, { opacity }]}
      pointerEvents="none"
    >
      <View style={[styles.tapZone, styles.tapZoneLeft]}>
        <Ionicons name="chevron-back" size={32} color="#fff" />
        <Text style={styles.tapZoneText}>Previous</Text>
      </View>
      <View style={[styles.tapZone, styles.tapZoneCenter]}>
        <Ionicons name="menu-outline" size={32} color="#fff" />
        <Text style={styles.tapZoneText}>Controls</Text>
      </View>
      <View style={[styles.tapZone, styles.tapZoneRight]}>
        <Ionicons name="chevron-forward" size={32} color="#fff" />
        <Text style={styles.tapZoneText}>Next</Text>
      </View>
    </Animated.View>
  );
}

/** Inner component that can access ReaderProvider context */
function ReaderContent({
  book,
  initialLocation,
  initialLocations,
  showHeader,
  showToc,
  showSettings,
  currentProgress,
  currentChapter,
  currentChapterHref,
  readerError,
  readerInstanceKey,
  readerReady,
  statusBarStyle,
  colors,
  onReaderTap,
  onClose,
  onOpenToc,
  onCloseToc,
  onLocationChange,
  onLocationsReady,
  onReady,
  onError,
  onRetryReader,
  onShowSettings,
  onCloseSettings,
}: ReaderContentProps) {
  useKeepAwake();

  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const footerTranslateY = useRef(new Animated.Value(0)).current;
  const chromeOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerTranslateY, {
        toValue: showHeader ? 0 : -120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(footerTranslateY, {
        toValue: showHeader ? 0 : 100,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(chromeOpacity, {
        toValue: showHeader ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showHeader, headerTranslateY, footerTranslateY, chromeOpacity]);

  const { toc, goToLocation, goPrevious, goNext, section } = useEpubReader();
  const { width: screenWidth } = useWindowDimensions();
  const pageAnimation = usePreferencesStore((s) => s.pageAnimation);

  // Page flip animation
  const pageSlideValue = useRef(new Animated.Value(0)).current;

  const playPageFlip = useCallback(
    (direction: "left" | "right") => {
      if (pageAnimation !== "slide") return;

      const from =
        direction === "left" ? screenWidth * 0.3 : -screenWidth * 0.3;
      pageSlideValue.setValue(from);
      Animated.timing(pageSlideValue, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [pageAnimation, pageSlideValue, screenWidth],
  );

  const pageFlipStyle = useMemo(() => {
    if (pageAnimation === "slide") {
      return { transform: [{ translateX: pageSlideValue }] };
    }
    return {};
  }, [pageAnimation, pageSlideValue]);

  const [showTapZoneHint, setShowTapZoneHint] = useState(true);

  const swipeActiveRef = useRef(false);

  const handleReaderPress = useCallback(
    (event: GestureResponderEvent) => {
      if (swipeActiveRef.current) {
        swipeActiveRef.current = false;
        return;
      }

      const tapX = event.nativeEvent.locationX;
      const leftBound = screenWidth * 0.25;
      const rightBound = screenWidth * 0.75;

      if (tapX < leftBound) {
        playPageFlip("right");
        goPrevious();
      } else if (tapX > rightBound) {
        playPageFlip("left");
        goNext();
      } else {
        onReaderTap();
      }
    },
    [screenWidth, goPrevious, goNext, onReaderTap, playPageFlip],
  );

  // Dismiss the tap zone hint after the animation finishes
  useEffect(() => {
    if (!showTapZoneHint) return;
    const timer = setTimeout(() => {
      setShowTapZoneHint(false);
    }, TAP_ZONE_HINT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showTapZoneHint]);

  // Use the epub reader's current section for TOC highlighting,
  // fall back to the persisted currentChapter from useReader
  const activeChapter = section?.label?.trim() || currentChapter;
  const activeChapterHref = section?.href || currentChapterHref;

  const handleSelectChapter = useCallback(
    (href: string) => {
      goToLocation(href);
      onCloseToc();
    },
    [goToLocation, onCloseToc],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar hidden={!showHeader} style={statusBarStyle} />

      {/* Reader Content */}
      <Pressable style={styles.readerContainer} onPress={handleReaderPress}>
        <Animated.View style={[styles.readerContainer, pageFlipStyle]}>
          <Reader
            key={`${book.id}-${readerInstanceKey}`}
            bookPath={book.filePath}
            initialLocation={initialLocation}
            initialLocations={initialLocations}
            onLocationChange={onLocationChange}
            onLocationsReady={onLocationsReady}
            onReady={onReady}
            onError={onError}
            onSwipeLeft={() => {
              swipeActiveRef.current = true;
              playPageFlip("left");
            }}
            onSwipeRight={() => {
              swipeActiveRef.current = true;
              playPageFlip("right");
            }}
          />
        </Animated.View>
      </Pressable>

      {/* Loading overlay — blocks touches until epub is ready */}
      {!readerReady && <View style={styles.loadingOverlay} />}

      {readerError && (
        <View
          style={[
            styles.errorOverlay,
            { backgroundColor: `${colors.background}F2` },
          ]}
        >
          <EmptyState
            icon="warning-outline"
            title="Reader Problem"
            message={readerError}
            action={
              <View style={styles.errorActions}>
                <Pressable
                  style={[
                    styles.errorActionButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={onRetryReader}
                >
                  <Text style={styles.errorActionPrimaryText}>
                    Reload Reader
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.errorActionButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={onClose}
                >
                  <Text
                    style={[
                      styles.errorActionSecondaryText,
                      { color: colors.primary },
                    ]}
                  >
                    Close Book
                  </Text>
                </Pressable>
              </View>
            }
          />
        </View>
      )}

      {/* Header Overlay */}
      <Animated.View
        style={[
          styles.headerOverlay,
          {
            opacity: chromeOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
        pointerEvents={showHeader ? "auto" : "none"}
      >
        <SafeAreaView
          style={{ backgroundColor: colors.headerBg }}
          edges={["top"]}
        >
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.headerButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text
                style={[styles.headerTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {book.title}
              </Text>
              {activeChapter && (
                <Text
                  style={[styles.headerSubtitle, { color: colors.subtext }]}
                  numberOfLines={1}
                >
                  {activeChapter}
                </Text>
              )}
            </View>

            <View style={styles.headerActions}>
              <Pressable style={styles.headerButton} onPress={onOpenToc}>
                <Ionicons name="list" size={24} color={colors.text} />
              </Pressable>
              <Pressable style={styles.headerButton} onPress={onShowSettings}>
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color={colors.text}
                />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Footer Overlay with Progress */}
      <Animated.View
        style={[
          styles.footerOverlay,
          {
            opacity: chromeOpacity,
            transform: [{ translateY: footerTranslateY }],
          },
        ]}
        pointerEvents={showHeader ? "auto" : "none"}
      >
        <SafeAreaView
          style={{ backgroundColor: colors.headerBg }}
          edges={["bottom"]}
        >
          <View style={styles.footer}>
            <View style={styles.progressRow}>
              <Pressable
                onPress={() => {
                  playPageFlip("right");
                  goPrevious();
                }}
                style={styles.navArrow}
                hitSlop={8}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={colors.primary}
                />
              </Pressable>
              <View style={styles.progressBarWrap}>
                <ProgressBar progress={currentProgress * 100} />
              </View>
              <Pressable
                onPress={() => {
                  playPageFlip("left");
                  goNext();
                }}
                style={styles.navArrow}
                hitSlop={8}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={colors.primary}
                />
              </Pressable>
            </View>
            <Text style={[styles.progressText, { color: colors.subtext }]}>
              {(currentProgress * 100).toFixed(2)}% complete
            </Text>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Tap Zone Hint */}
      <TapZoneHint visible={showTapZoneHint} colors={colors} />

      {/* Table of Contents Modal */}
      <Modal
        visible={showToc}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onCloseToc}
      >
        <TableOfContents
          items={toc}
          visible={showToc}
          currentChapterHref={activeChapterHref}
          currentChapterTitle={activeChapter}
          onSelectChapter={handleSelectChapter}
          onClose={onCloseToc}
        />
      </Modal>

      {/* Reader Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onCloseSettings}
      >
        <ReaderSettings onClose={onCloseSettings} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  readerContainer: {
    flex: 1,
    overflow: "hidden",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 120,
  },
  errorActions: {
    flexDirection: "row",
    gap: 12,
  },
  errorActionButton: {
    minWidth: 132,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorActionPrimaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  errorActionSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
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
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarWrap: {
    flex: 1,
  },
  navArrow: {
    padding: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  // Tap zone hint
  tapZoneOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    flexDirection: "row",
  },
  tapZone: {
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  tapZoneLeft: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: "rgba(255,255,255,0.2)",
  },
  tapZoneCenter: {
    flex: 1.5,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  tapZoneRight: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: "rgba(255,255,255,0.2)",
  },
  tapZoneText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

export default ReaderScreen;
