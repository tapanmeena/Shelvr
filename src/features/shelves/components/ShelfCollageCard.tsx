import { useThemeColors } from "@/src/stores/preferencesStore";
import { ShelfWithPreview } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface ShelfCollageCardProps {
  shelf: ShelfWithPreview;
  onPress: () => void;
  onLongPress?: () => void;
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

function CoverSlot({
  coverPath,
  index,
  shelfName,
  surfaceColor,
}: {
  coverPath: string | null;
  index: number;
  shelfName: string;
  surfaceColor: string;
}) {
  if (coverPath) {
    return (
      <Image
        source={{ uri: `file://${coverPath}` }}
        style={styles.coverImage}
        resizeMode="cover"
      />
    );
  }
  return (
    <View
      style={[
        styles.coverImage,
        { backgroundColor: getPlaceholderColor(shelfName + index) },
      ]}
    >
      <Ionicons name="book" size={16} color="rgba(255,255,255,0.5)" />
    </View>
  );
}

function EmptySlot({ surfaceColor }: { surfaceColor: string }) {
  return (
    <View style={[styles.coverImage, { backgroundColor: surfaceColor }]} />
  );
}

export function ShelfCollageCard({
  shelf,
  onPress,
  onLongPress,
}: ShelfCollageCardProps) {
  const colors = useThemeColors();

  const slots = [0, 1, 2, 3];
  const accentColor = shelf.color ?? colors.accent;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Accent strip */}
      <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />

      {/* Cover mosaic */}
      <View style={styles.mosaic}>
        {slots.map((i) => {
          if (i < shelf.coverPaths.length) {
            return (
              <CoverSlot
                key={i}
                coverPath={shelf.coverPaths[i]}
                index={i}
                shelfName={shelf.name}
                surfaceColor={colors.surfaceHover}
              />
            );
          }
          return <EmptySlot key={i} surfaceColor={colors.surfaceHover} />;
        })}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {shelf.name}
        </Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {shelf.bookCount} {shelf.bookCount === 1 ? "book" : "books"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  accentStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    zIndex: 1,
  },
  mosaic: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    padding: 6,
    paddingLeft: 10,
    aspectRatio: 1.3,
  },
  coverImage: {
    flex: 1,
    minWidth: "45%",
    aspectRatio: 2 / 3,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
  },
  count: {
    fontSize: 12,
    marginTop: 2,
  },
});
