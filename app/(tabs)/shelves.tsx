import { EmptyState } from "@/src/components/EmptyState";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { useDatabaseStatus } from "@/src/database/useDatabase";
import { CreateShelfModal } from "@/src/features/shelves/components/CreateShelfModal";
import { ShelfCollageCard } from "@/src/features/shelves/components/ShelfCollageCard";
import { ShelfRow } from "@/src/features/shelves/components/ShelfRow";
import { useShelves } from "@/src/features/shelves/hooks/useShelves";
import {
  usePreferencesStore,
  useThemeColors,
} from "@/src/stores/preferencesStore";
import { Shelf, ShelfWithPreview } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;

export default function ShelvesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { isReady: dbReady } = useDatabaseStatus();
  const {
    shelves,
    shelvesWithPreviews,
    isLoading,
    createShelf,
    deleteShelf,
    refresh,
  } = useShelves();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const viewMode = usePreferencesStore((s) => s.shelvesViewMode);
  const setViewMode = usePreferencesStore((s) => s.setShelvesViewMode);

  const screenWidth = Dimensions.get("window").width;
  const cardWidth = useMemo(
    () => (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2,
    [screenWidth],
  );

  if (!dbReady) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LoadingSpinner fullScreen message="Loading..." />
      </SafeAreaView>
    );
  }

  const handleCreateShelf = async (name: string, description?: string) => {
    try {
      await createShelf(name, { description });
      setShowCreateModal(false);
    } catch {
      Alert.alert("Error", "Failed to create shelf");
    }
  };

  const handleDeleteShelf = (shelf: Shelf) => {
    Alert.alert(
      "Delete Shelf",
      `Are you sure you want to delete "${shelf.name}"? Books won't be removed from your library.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteShelf(shelf.id);
            } catch {
              Alert.alert("Error", "Failed to delete shelf");
            }
          },
        },
      ],
    );
  };

  const handleShelfPress = (shelf: Shelf) => {
    router.push(`/shelf/${shelf.id}` as any);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "cards" ? "bookshelf" : "cards");
  };

  const renderCollageCard = ({
    item,
    index,
  }: {
    item: ShelfWithPreview;
    index: number;
  }) => (
    <View
      style={[
        styles.cardWrapper,
        { width: cardWidth },
        index % 2 === 0 ? { marginRight: CARD_GAP } : null,
      ]}
    >
      <ShelfCollageCard
        shelf={item}
        onPress={() => handleShelfPress(item)}
        onLongPress={() => handleDeleteShelf(item)}
      />
    </View>
  );

  const renderShelfRow = ({ item }: { item: ShelfWithPreview }) => (
    <ShelfRow shelf={item} onShelfPress={() => handleShelfPress(item)} />
  );

  const emptyComponent = (
    <EmptyState
      icon="layers-outline"
      title="No Shelves Yet"
      message="Create shelves to organize your books into collections"
      actionLabel="Create Shelf"
      onAction={() => setShowCreateModal(true)}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Shelves
        </Text>
        <View style={styles.headerActions}>
          {shelves.length > 0 && (
            <Pressable onPress={toggleViewMode} hitSlop={8}>
              <Ionicons
                name={viewMode === "cards" ? "reorder-three" : "grid-outline"}
                size={24}
                color={colors.text}
              />
            </Pressable>
          )}
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner message="Loading shelves..." />
      ) : viewMode === "cards" ? (
        <FlatList
          key="cards-grid"
          data={shelvesWithPreviews}
          renderItem={renderCollageCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.cardsList}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refresh}
          ListEmptyComponent={emptyComponent}
        />
      ) : (
        <FlatList
          key="bookshelf-list"
          data={shelvesWithPreviews}
          renderItem={renderShelfRow}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bookshelfList}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refresh}
          ListEmptyComponent={emptyComponent}
        />
      )}

      {/* FAB */}
      {shelves.length > 0 && (
        <Pressable
          style={[styles.fab, { backgroundColor: colors.accent }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}

      <CreateShelfModal
        visible={showCreateModal}
        onConfirm={handleCreateShelf}
        onCancel={() => setShowCreateModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  cardsList: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: CARD_GAP,
  },
  bookshelfList: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
