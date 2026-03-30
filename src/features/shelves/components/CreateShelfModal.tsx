import { useThemeColors } from "@/src/stores/preferencesStore";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface CreateShelfModalProps {
  visible: boolean;
  onConfirm: (name: string, description?: string) => void;
  onCancel: () => void;
}

export function CreateShelfModal({
  visible,
  onConfirm,
  onCancel,
}: CreateShelfModalProps) {
  const colors = useThemeColors();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim(), description.trim() || undefined);
      setName("");
      setDescription("");
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable
          style={[styles.content, { backgroundColor: colors.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.text }]}>New Shelf</Text>

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            placeholder="Shelf name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={100}
          />

          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
          />

          <View style={styles.actions}>
            <Pressable
              style={[styles.button, { borderColor: colors.border }]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.primaryButton,
                { backgroundColor: colors.accent },
                !name.trim() && styles.disabledButton,
              ]}
              onPress={handleConfirm}
              disabled={!name.trim()}
            >
              <Text style={[styles.buttonText, { color: "#fff" }]}>Create</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  content: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  descriptionInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  primaryButton: {
    borderWidth: 0,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
