import { parseEpubMetadata, validateEpubFile } from "@/src/features/library/services/epubParser";
import { PickedFile } from "@/src/features/library/services/filePicker";
import { Book } from "@/src/types";
import { libraryLog } from "@/src/utils/logger";
import * as FileSystem from "expo-file-system/legacy";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const getDocumentDirectory = (): string => {
  const fs = FileSystem;
  return fs.documentDirectory || "";
};

const BOOKS_DIRECTORY = `${getDocumentDirectory()}books/`;
const COVERS_DIRECTORY = `${getDocumentDirectory()}covers/`;

interface ImportResult {
  success: boolean;
  book?: Book;
  error?: string;
}

// Ensure the book directory exists
const ensureBooksDirectory = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(BOOKS_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BOOKS_DIRECTORY, {
      intermediates: true,
    });
  }
};

// Import ePUB file into the library
export const importBook = async (pickedFile: PickedFile): Promise<ImportResult> => {
  try {
    // Validate the ePUB file
    const validation = await validateEpubFile(pickedFile.uri);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error?.userMessage ?? "Failed to validate ePUB  file",
      };
    }

    // Ensure book directory exists
    await ensureBooksDirectory();

    // Generate UUID and destination path
    const bookId = uuidv4();
    const sanitizedName = pickedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const destinationPath = `${BOOKS_DIRECTORY}${bookId}/${sanitizedName}`;

    // Copy file to app storage
    libraryLog.debug("Copying file to :", destinationPath);
    await FileSystem.copyAsync({
      from: pickedFile.uri,
      to: destinationPath,
    });

    // Verify the copy
    const copyInfo = await FileSystem.getInfoAsync(destinationPath);
    if (!copyInfo.exists) {
      return { success: false, error: "Failed to copy file to app storage" };
    }

    // Parse metadata
    const metadata = await parseEpubMetadata(destinationPath);

    // Save cover image to filesystem if present
    let coverPath: string | undefined;
    if (metadata.coverBase64) {
      try {
        const coversDirInfo = await FileSystem.getInfoAsync(COVERS_DIRECTORY);
        if (!coversDirInfo.exists) {
          await FileSystem.makeDirectoryAsync(COVERS_DIRECTORY, { intermediates: true });
        }

        const ext = metadata.coverMimeType?.includes("png") ? "png" : "jpg";
        coverPath = `${COVERS_DIRECTORY}${bookId}.${ext}`;
        await FileSystem.writeAsStringAsync(coverPath, metadata.coverBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        libraryLog.debug("Saved cover image to:", coverPath);
      } catch (err) {
        libraryLog.warn("Failed to save cover image:", err);
      }
    }

    // Create book record
    const now = Date.now();
    const book: Book = {
      id: bookId,
      title: metadata.title,
      authors: metadata.authors.length > 0 ? metadata.authors : undefined,
      description: metadata.description,
      coverPath,
      filePath: destinationPath,
      source: "local",
      fileSize: pickedFile.size,
      publishedDate: metadata.publishedDate,
      language: metadata.language,
      series: metadata.series,
      seriesIndex: metadata.seriesIndex,
      createdAt: now,
      updatedAt: now,
    };

    libraryLog.info("Book imported successfully:", book.title);
    return { success: true, book };
  } catch (error) {
    libraryLog.error("Error importing book:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import book",
    };
  }
};
