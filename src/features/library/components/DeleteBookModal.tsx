/**
 * Delete Book Modal
 *
 * Confirmation dialog for deleting books from library
 * Offers options to keep or delete the file
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Book } from "@/src/types";

interface DeleteBookModalProps {
  visible: boolean;
  book: Book | null;
  onConfirm: (deleteFile: boolean) => Promise<void>;
  onCancel: () => void;
}

export function DeleteBookModal({ visible, book, onConfirm, onCancel }: DeleteBookModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFile, setDeleteFile] = useState(false);

  const colors = {
    background: isDark ? "#1a1a2e" : "#ffffff",
    card: isDark ? "#16213e" : "#f8f9fa",
    text: isDark ? "#eaeaea" : "#1a1a2e",
    subtext: isDark ? "#a0a0a0" : "#666666",
    primary: "#e94560",
    border: isDark ? "#2d3748" : "#e2e8f0",
    danger: "#dc2626",
    success: "#22c55e",
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(deleteFile);
    } finally {
      setIsDeleting(false);
      setDeleteFile(false);
    }
  };

  const handleCancel = () => {
    setDeleteFile(false);
    onCancel();
  };

  if (!book) {
    return null;
  }

  const isKomgaBook = book.source === "komga";
  const fileSize = book.fileSize ? formatFileSize(book.fileSize) : "Unknown size";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="trash-outline" size={32} color={colors.danger} />
            <Text style={[styles.title, { color: colors.text }]}>Remove Book?</Text>
          </View>

          {/* Book Info */}
          <View style={[styles.bookInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
              {book.title}
            </Text>
            {book.authors && book.authors.length > 0 && <Text style={[styles.bookAuthor, { color: colors.subtext }]}>{book.authors.join(", ")}</Text>}
            <View style={styles.bookMeta}>
              {isKomgaBook && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="cloud-outline" size={12} color="#fff" />
                  <Text style={styles.badgeText}>Komga</Text>
                </View>
              )}
              <Text style={[styles.fileSize, { color: colors.subtext }]}>{fileSize}</Text>
            </View>
          </View>

          {/* Delete File Option */}
          <Pressable
            style={[styles.optionRow, { borderColor: colors.border }, deleteFile && { backgroundColor: colors.card }]}
            onPress={() => setDeleteFile(!deleteFile)}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Also delete downloaded file</Text>
              <Text style={[styles.optionDescription, { color: colors.subtext }]}>
                {deleteFile ? "The ePUB file will be permanently deleted" : "The file will remain on your device"}
              </Text>
            </View>
            <View
              style={[styles.checkbox, { borderColor: deleteFile ? colors.danger : colors.border }, deleteFile && { backgroundColor: colors.danger }]}
            >
              {deleteFile && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </Pressable>

          {/* Warning for file deletion */}
          {deleteFile && (
            <View style={[styles.warning, { backgroundColor: `${colors.danger}15` }]}>
              <Ionicons name="warning-outline" size={16} color={colors.danger} />
              <Text style={[styles.warningText, { color: colors.danger }]}>This cannot be undone. You&apos;ll need to re-download the book.</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.cancelButton, { borderColor: colors.border }]} onPress={handleCancel} disabled={isDeleting}>
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.deleteButton, { backgroundColor: colors.danger }, isDeleting && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={[styles.buttonText, { color: "#fff" }]}>{deleteFile ? "Delete All" : "Remove"}</Text>
                </>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },
  bookInfo: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  fileSize: {
    fontSize: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    borderWidth: 1,
  },
  deleteButton: {},
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
