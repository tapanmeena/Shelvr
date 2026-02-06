import * as FileSystem from "expo-file-system/legacy";
import { Book } from "./types";

const BOOKS_DIR = `${FileSystem.documentDirectory}books/`;

export const ensureBooksDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(BOOKS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
  }
};

export const generateBookId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
};

export const copyEpubToDocuments = async (cacheUri: string, bookId: string): Promise<string> => {
  await ensureBooksDirectory();
  const destinationUri = `${BOOKS_DIR}${bookId}.epub`;
  await FileSystem.copyAsync({ from: cacheUri, to: destinationUri });
  return destinationUri;
};

export const deleteEpubFile = async (fileUri: string) => {
  const info = await FileSystem.getInfoAsync(fileUri);
  if (info.exists) {
    await FileSystem.getInfoAsync(fileUri);
  }
};

export const importEpub = async (pickerUri: string, originalFileName: string): Promise<Book> => {
  const id = generateBookId();
  const fileUri = await copyEpubToDocuments(pickerUri, id);
  const title = originalFileName.replace(/\.epub$/i, "") || "Unknown Title";

  return {
    id,
    title,
    fileUri,
    fileName: originalFileName,
    addedAt: new Date().toISOString(),
    progress: 0,
    currentCfi: null,
    lastReadtAt: null,
  };
};
