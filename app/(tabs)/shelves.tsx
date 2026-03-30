import { EmptyState } from "@/src/components/EmptyState";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { useDatabaseStatus } from "@/src/database/useDatabase";
import { CreateShelfModal } from "@/src/features/shelves/components/CreateShelfModal";
import { useShelves } from "@/src/features/shelves/hooks/useShelves";
import { useThemeColors } from "@/src/stores/preferencesStore";
import { Shelf } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShelvesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { isReady: dbReady } = useDatabaseStatus();
  const { shelves, isLoading, createShelf, deleteShelf, refresh } =
    useShelves();
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const renderShelf = ({ item }: { item: Shelf }) => (
    <Pressable
      style={[styles.shelfCard, { backgroundColor: colors.surface }]}
      onPress={() => handleShelfPress(item)}
      onLongPress={() => handleDeleteShelf(item)}
    >
      <View
        style={[
          styles.shelfIcon,
          { backgroundColor: item.color ?? colors.accent + "20" },
        ]}
      >
        <Ionicons
          name={(item.icon as any) ?? "library-outline"}
          size={24}
          color={item.color ?? colors.accent}
        />
      </View>
      <View style={styles.shelfInfo}>
        <Text style={[styles.shelfName, { color: colors.text }]}>
          {item.name}
        </Text>
        {item.description && (
          <Text
            style={[styles.shelfDescription, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.description}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
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
      </View>

      {isLoading ? (
        <LoadingSpinner message="Loading shelves..." />
      ) : (
        <FlatList
          data={shelves}
          renderItem={renderShelf}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refresh}
          ListEmptyComponent={
            <EmptyState
              icon="layers-outline"
              title="No Shelves Yet"
              message="Create shelves to organize your books into collections"
              actionLabel="Create Shelf"
              onAction={() => setShowCreateModal(true)}
            />
          }
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  shelfCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    gap: 14,
  },
  shelfIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  shelfInfo: {
    flex: 1,
  },
  shelfName: {
    fontSize: 16,
    fontWeight: "600",
  },
  shelfDescription: {
    fontSize: 13,
    marginTop: 2,
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
