import { libraryLog } from "@/src/utils/logger";
import * as DocumentPicker from "expo-document-picker";

export interface PickedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

interface FilePickerResult {
  success: boolean;
  file?: PickedFile;
  error?: string;
}

// Opens the document picker to select the epub file
export const pickEpubFile = async (): Promise<FilePickerResult> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/epub+zip",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false, error: "File selection cancelled" };
    }

    const asset = result.assets[0];

    // Validate file extension
    if (!asset.name.toLowerCase().endsWith(".epub")) {
      return { success: false, error: "Please select an ePUB file" };
    }

    return {
      success: true,
      file: {
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? 0,
        mimeType: asset.mimeType ?? "application/epub+zip",
      },
    };
  } catch (error) {
    libraryLog.error("Error picking file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to pick file",
    };
  }
};
