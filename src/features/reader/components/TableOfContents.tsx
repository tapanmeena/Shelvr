import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface TocItem {
  id: string;
  href: string;
  label: string;
  subitems?: TocItem[];
}

interface TableOfContentsProps {
  items: TocItem[];
  currentChapter?: string;
  onSelectChapter: (href: string) => void;
  onClose: () => void;
}

/** Flatten TOC tree into ordered list with depth info for determining "past" chapters */
function flattenToc(items: TocItem[]): { label: string; href: string }[] {
  const result: { label: string; href: string }[] = [];
  for (const item of items) {
    result.push({ label: item.label.trim(), href: item.href });
    if (item.subitems?.length) {
      result.push(...flattenToc(item.subitems));
    }
  }
  return result;
}

/** Filter TOC tree, keeping parents that have matching children */
function filterToc(items: TocItem[], query: string): TocItem[] {
  const lower = query.toLowerCase();
  return items.reduce<TocItem[]>((acc, item) => {
    const matchesSelf = item.label.toLowerCase().includes(lower);
    const filteredSubs = item.subitems ? filterToc(item.subitems, query) : [];
    if (matchesSelf || filteredSubs.length > 0) {
      acc.push({ ...item, subitems: matchesSelf ? item.subitems : filteredSubs });
    }
    return acc;
  }, []);
}

export const TableOfContents = ({ items, currentChapter, onSelectChapter, onClose }: TableOfContentsProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [searchQuery, setSearchQuery] = useState("");

  const colors = {
    background: isDark ? "#1a1a2e" : "#ffffff",
    text: isDark ? "#eaeaea" : "#1a1a2e",
    subtext: isDark ? "#a0a0a0" : "#666666",
    primary: "#e94560",
    border: isDark ? "#2d3748" : "#e2e8f0",
    active: isDark ? "rgba(233, 69, 96, 0.15)" : "rgba(233, 69, 96, 0.08)",
    searchBg: isDark ? "#242445" : "#f1f3f5",
    searchText: isDark ? "#eaeaea" : "#1a1a2e",
    searchPlaceholder: isDark ? "#666" : "#999",
    pastCheck: isDark ? "#4ade80" : "#22c55e",
  };

  const scrollViewRef = useRef<ScrollView>(null);
  const hasScrolled = useRef(false);

  // Determine which chapters are "past" (before the current one)
  // and which parent items contain the active subitem
  const { pastChapters, activeParents } = useMemo(() => {
    const past = new Set<string>();
    const parents = new Set<string>();
    if (!currentChapter) return { pastChapters: past, activeParents: parents };

    const flat = flattenToc(items);
    // Only build "past" set if currentChapter actually exists in the TOC
    const currentExists = flat.some((e) => e.label === currentChapter);
    if (currentExists) {
      for (const entry of flat) {
        if (entry.label === currentChapter) break;
        past.add(entry.label);
      }
    }

    // Find parents that contain the active subitem
    const findActiveParent = (tocItems: TocItem[]): boolean => {
      for (const item of tocItems) {
        const trimmed = item.label.trim();
        if (trimmed === currentChapter) return true;
        if (item.subitems?.length) {
          const childIsActive = findActiveParent(item.subitems);
          if (childIsActive) {
            parents.add(trimmed);
            return true;
          }
        }
      }
      return false;
    };
    findActiveParent(items);

    return { pastChapters: past, activeParents: parents };
  }, [items, currentChapter]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return filterToc(items, searchQuery.trim());
  }, [items, searchQuery]);

  const handleActiveLayout = useCallback((event: LayoutChangeEvent) => {
    if (hasScrolled.current) return;
    hasScrolled.current = true;
    const y = event.nativeEvent.layout.y;
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 120), animated: true });
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelectChapter(href);
    },
    [onSelectChapter],
  );

  const renderItem = (item: TocItem, depth: number = 0) => {
    const trimmedLabel = item.label.trim();
    const isActive = currentChapter === trimmedLabel;
    const isActiveParent = activeParents.has(trimmedLabel);
    const isPast = pastChapters.has(trimmedLabel);
    const isTopLevel = depth === 0;
    const shouldHighlight = isActive || isActiveParent;

    return (
      <View key={item.id || item.href} onLayout={isActive ? handleActiveLayout : undefined}>
        <Pressable
          style={({ pressed }) => [
            styles.item,
            { paddingLeft: 20 + depth * 16 },
            shouldHighlight && [styles.itemActive, { backgroundColor: colors.active }],
            pressed && styles.itemPressed,
          ]}
          onPress={() => handleSelect(item.href)}
          android_ripple={{ color: colors.active, borderless: false }}
        >
          {/* Left accent bar for active item or active parent */}
          {shouldHighlight && <View style={[styles.activeBar, { backgroundColor: colors.primary }]} />}

          {/* Status indicator */}
          {isPast && !shouldHighlight ? (
            <Ionicons name="checkmark-circle" size={16} color={colors.pastCheck} style={styles.statusIcon} />
          ) : isActive ? (
            <Ionicons name="radio-button-on" size={14} color={colors.primary} style={styles.statusIcon} />
          ) : isActiveParent ? (
            <Ionicons name="ellipsis-horizontal-circle" size={16} color={colors.primary} style={styles.statusIcon} />
          ) : (
            <View style={[styles.statusDot, { borderColor: colors.border }]} />
          )}

          {/* Label */}
          <Text
            style={[
              styles.itemText,
              isTopLevel && styles.itemTextTopLevel,
              { color: shouldHighlight ? colors.primary : isPast ? colors.subtext : colors.text },
              shouldHighlight && styles.itemTextActive,
              !isTopLevel && styles.itemTextSub,
            ]}
          >
            {trimmedLabel}
          </Text>

          {isActive && (
            <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.activeBadgeText}>Reading</Text>
            </View>
          )}
        </Pressable>

        {item.subitems?.map((subitem) => renderItem(subitem, depth + 1))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Drag handle */}
      <View style={styles.dragHandleContainer}>
        <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Contents</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
        >
          <View style={[styles.closeCircle, { backgroundColor: colors.searchBg }]}>
            <Ionicons name="close" size={18} color={colors.subtext} />
          </View>
        </Pressable>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.searchBg }]}>
          <Ionicons name="search" size={16} color={colors.searchPlaceholder} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.searchText }]}
            placeholder="Search chapters..."
            placeholderTextColor={colors.searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.searchPlaceholder} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Separator with shadow */}
      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* Chapter list */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filteredItems.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{searchQuery ? "No matches found" : "No table of contents"}</Text>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              {searchQuery ? "Try a different search term" : "This book doesn't have a table of contents"}
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => renderItem(item, 0))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  closeButton: {
    borderRadius: 20,
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingRight: 20,
    position: "relative",
    overflow: "hidden",
  },
  itemActive: {
    borderRadius: 0,
  },
  itemPressed: {
    opacity: 0.7,
  },
  activeBar: {
    position: "absolute",
    left: 0,
    top: 4,
    bottom: 4,
    width: 3,
    borderRadius: 2,
  },
  statusIcon: {
    marginRight: 10,
    width: 16,
    textAlign: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    marginRight: 14,
    marginLeft: 4,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  itemTextTopLevel: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemTextSub: {
    fontSize: 14,
  },
  itemTextActive: {
    fontWeight: "700",
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  activeBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
