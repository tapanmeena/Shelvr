import { useThemeColors } from "@/src/stores/preferencesStore";
import { useShelfStore } from "@/src/stores/shelfStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface AddToShelfSheetProps {
  visible: boolean;
  bookId: string;
  bookTitle: string;
  onAddToShelf: (bookId: string, shelfId: string) => Promise<void>;
  onRemoveFromShelf: (bookId: string, shelfId: string) => Promise<void>;
  onClose: () => void;
}

export function AddToShelfSheet({
  visible,
  bookId,
  bookTitle,
  onAddToShelf,
  onRemoveFromShelf,
  onClose,
}: AddToShelfSheetProps) {
  const colors = useThemeColors();
  const shelves = useShelfStore((s) => s.shelves);
  const bookShelfMap = useShelfStore((s) => s.bookShelfMap);
  const [loading, setLoading] = useState<string | null>(null);

  const bookShelfIds = bookShelfMap[bookId] ?? [];

  const handleToggle = async (shelfId: string) => {
    setLoading(shelfId);
    try {
      if (bookShelfIds.includes(shelfId)) {
        await onRemoveFromShelf(bookId, shelfId);
      } else {
        await onAddToShelf(bookId, shelfId);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Add to Shelf
          </Text>
          <Text
            style={[styles.subtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {bookTitle}
          </Text>

          {/* Shelf list */}
          {shelves.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="layers-outline"
                size={40}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No shelves yet. Create one from the Shelves tab.
              </Text>
            </View>
          ) : (
            <FlatList
              data={shelves}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => {
                const isInShelf = bookShelfIds.includes(item.id);
                const isLoading = loading === item.id;
                const accentColor = item.color ?? colors.accent;

                return (
                  <Pressable
                    style={[
                      styles.shelfRow,
                      { backgroundColor: colors.surface },
                      isInShelf && {
                        backgroundColor: accentColor + "15",
                        borderColor: accentColor + "40",
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => handleToggle(item.id)}
                    disabled={isLoading}
                  >
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: accentColor },
                      ]}
                    />
                    <Text
                      style={[styles.shelfName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Ionicons
                      name={
                        isInShelf ? "checkmark-circle" : "add-circle-outline"
                      }
                      size={24}
                      color={isInShelf ? accentColor : colors.textSecondary}
                    />
                  </Pressable>
                );
              }}
            />
          )}

          {/* Done button */}
          <Pressable
            style={[styles.doneButton, { backgroundColor: colors.accent }]}
            onPress={onClose}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: "70%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  list: {
    maxHeight: 300,
  },
  shelfRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  shelfName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 240,
  },
  doneButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  doneText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
