import type { DownloadProgressData } from "expo-file-system/legacy";
import * as ExpoFileSystem from "expo-file-system/legacy";
import { useCallback, useState } from "react";

export function useFileSystem() {
  const [file, setFile] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [size, setSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const downloadFile = useCallback(async (fromUrl: string, toFile: string) => {
    const callback = (downloadProgress: DownloadProgressData) => {
      const currentProgress = Math.round((downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100);
      setProgress(currentProgress);
    };

    const downloadResumable = ExpoFileSystem.createDownloadResumable(fromUrl, ExpoFileSystem.documentDirectory + toFile, { cache: true }, callback);

    setDownloading(true);

    try {
      const value = await downloadResumable.downloadAsync();
      if (!value) throw new Error("Download failed");
      setSuccess(true);
      setError(null);
      setFile(value.uri);
      return { uri: value.uri, mimeType: value.mimeType };
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else setError("Error downloading file");

      return { uri: null, mimeType: null };
    } finally {
      setDownloading(false);
    }
  }, []);

  const getFileInfo = useCallback(async (fileUri: string) => {
    const info = await ExpoFileSystem.getInfoAsync(fileUri);

    return {
      uri: info.uri,
      exists: info.exists,
      isDirectory: info.isDirectory,
      size: info.exists ? info.size : undefined,
    };
  }, []);

  return {
    file,
    progress,
    downloading,
    size,
    error,
    success,
    documentDirectory: ExpoFileSystem.documentDirectory,
    cacheDirectory: ExpoFileSystem.cacheDirectory,
    bundleDirectory: ExpoFileSystem.bundleDirectory || undefined,
    readAsStringAsync: ExpoFileSystem.readAsStringAsync,
    writeAsStringAsync: ExpoFileSystem.writeAsStringAsync,
    deleteAsync: ExpoFileSystem.deleteAsync,
    downloadFile,
    getFileInfo,
  };
}
