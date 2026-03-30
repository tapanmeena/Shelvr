import { useThemeColors } from "@/src/stores/preferencesStore";
import { ShelfWithPreview } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ShelfRowProps {
  shelf: ShelfWithPreview;
  onShelfPress: () => void;
  onBookPress?: (bookId: string) => void;
}

const PLACEHOLDER_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
];

function getPlaceholderColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length];
}

export function ShelfRow({ shelf, onShelfPress }: ShelfRowProps) {
  const colors = useThemeColors();
  const accentColor = shelf.color ?? colors.accent;

  const renderCover = ({
    item,
    index,
  }: {
    item: string | null;
    index: number;
  }) => {
    if (item) {
      return (
        <Image
          source={{ uri: `file://${item}` }}
          style={styles.cover}
          resizeMode="cover"
        />
      );
    }
    return (
      <View
        style={[
          styles.cover,
          { backgroundColor: getPlaceholderColor(shelf.name + index) },
        ]}
      >
        <Ionicons name="book" size={18} color="rgba(255,255,255,0.5)" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Label row */}
      <Pressable style={styles.labelRow} onPress={onShelfPress}>
        <View style={styles.labelLeft}>
          <View style={[styles.colorDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.shelfName, { color: colors.text }]}>
            {shelf.name}
          </Text>
          <Text style={[styles.bookCount, { color: colors.textSecondary }]}>
            ({shelf.bookCount})
          </Text>
        </View>
        <Pressable onPress={onShelfPress} hitSlop={8}>
          <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
        </Pressable>
      </Pressable>

      {/* Covers row */}
      {shelf.coverPaths.length > 0 ? (
        <FlatList
          data={shelf.coverPaths}
          renderItem={renderCover}
          keyExtractor={(_, i) => `${shelf.id}-cover-${i}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.coversRow}
        />
      ) : (
        <Pressable
          style={[styles.emptyShelf, { borderColor: colors.border }]}
          onPress={onShelfPress}
        >
          <Ionicons name="add-outline" size={24} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Add books
          </Text>
        </Pressable>
      )}

      {/* Shelf plank */}
      <View style={[styles.plank, { backgroundColor: colors.border }]}>
        <View
          style={[styles.plankShadow, { backgroundColor: colors.border }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  labelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  shelfName: {
    fontSize: 16,
    fontWeight: "700",
  },
  bookCount: {
    fontSize: 14,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  coversRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  cover: {
    width: 80,
    height: 120,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyShelf: {
    marginHorizontal: 20,
    height: 120,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  emptyText: {
    fontSize: 13,
  },
  plank: {
    height: 3,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 1.5,
  },
  plankShadow: {
    height: 1,
    opacity: 0.3,
    marginTop: 1,
  },
});
