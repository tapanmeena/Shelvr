import { libraryLog } from "@/src/utils/logger";
import * as FileSystem from "expo-file-system/legacy";

export interface EpubMetadata {
  title: string;
  authors: string[];
  description?: string;
  language?: string;
  publishedDate?: string;
  coverImagePath?: string;
}

/**
 * Custom error class for ePUB parsing errors
 * Provides user-friendly error messages for different failure scenarios
 */
export class EpubParseError extends Error {
  public readonly userMessage: string;
  public readonly code: EpubErrorCode;
  public readonly recoverable: boolean;

  constructor(code: EpubErrorCode, technicalMessage: string) {
    super(technicalMessage);
    this.name = "EpubParseError";
    this.code = code;
    this.userMessage = EPUB_ERROR_MESSAGES[code];
    this.recoverable = RECOVERABLE_ERRORS.has(code);
  }
}

export type EpubErrorCode =
  | "FILE_NOT_FOUND"
  | "FILE_TOO_SMALL"
  | "INVALID_EXTENSION"
  | "CORRUPTED_ARCHIVE"
  | "MISSING_CONTAINER"
  | "MISSING_CONTENT"
  | "INVALID_STRUCTURE"
  | "PERMISSION_DENIED"
  | "UNKNOWN_ERROR";

const EPUB_ERROR_MESSAGES: Record<EpubErrorCode, string> = {
  FILE_NOT_FOUND: "The ePUB file could not be found. It may have been moved or deleted.",
  FILE_TOO_SMALL: "This file is too small to be a valid ePUB. It may be corrupted or incomplete.",
  INVALID_EXTENSION: "This file is not an ePUB. Please select a file with the .epub extension.",
  CORRUPTED_ARCHIVE: "This ePUB file appears to be corrupted. Try re-downloading or obtaining a new copy.",
  MISSING_CONTAINER: "This ePUB is missing required structure files. It may be an unsupported format.",
  MISSING_CONTENT: "This ePUB is missing its content file. It may be an incomplete or damaged file.",
  INVALID_STRUCTURE: "This ePUB has an invalid structure. It may be an unsupported or non-standard format.",
  PERMISSION_DENIED: "Cannot access this file. Please check file permissions.",
  UNKNOWN_ERROR: "An unexpected error occurred while reading this ePUB. Please try again.",
};

const RECOVERABLE_ERRORS = new Set<EpubErrorCode>(["PERMISSION_DENIED", "UNKNOWN_ERROR"]);

/**
 * Validation result with detailed error information
 */
export interface EpubValidationResult {
  valid: boolean;
  error?: EpubParseError;
  warnings?: string[];
}

export const parseEpubMetadata = async (epubUri: string): Promise<EpubMetadata> => {
  try {
    // TODO: full parsing needs to be done here
    const fileName = epubUri.split("/").pop() || "Unknown";
    const titleFromFile = fileName.replace(/\.epub$/i, "").replace(/_/g, " ");

    // Basic metadata extraction
    const metadata: EpubMetadata = {
      title: titleFromFile,
      authors: [],
    };

    return metadata;
  } catch (error) {
    libraryLog.error("Error parsing ePUB metadata:", error);
    // Returns basic metadata on error
    const fileName = epubUri.split("/").pop() || "Unknown";
    return {
      title: fileName.replace(/\.epub$/i, ""),
      authors: [],
    };
  }
};

export const validateEpubFile = async (epubUri: string): Promise<EpubValidationResult> => {
  const warnings: string[] = [];

  try {
    // Check file exists
    const fileInfo = await FileSystem.getInfoAsync(epubUri);
    if (!fileInfo.exists) {
      return {
        valid: false,
        error: new EpubParseError("FILE_NOT_FOUND", `File not found: ${epubUri}`),
      };
    }

    // Check extension
    if (!epubUri.toLowerCase().endsWith(".epub")) {
      return {
        valid: false,
        error: new EpubParseError("INVALID_EXTENSION", `Invalid extension: ${epubUri}`),
      };
    }

    // Check file size (should be at least 1KB for a valid ePUB)
    const MIN_EPUB_SIZE = 1000; // 1KB minimum
    const MAX_EPUB_SIZE = 2 * 1024 * 1024 * 1024; // 2GB maximum

    if (fileInfo.size !== undefined) {
      if (fileInfo.size < MIN_EPUB_SIZE) {
        return {
          valid: false,
          error: new EpubParseError("FILE_TOO_SMALL", `File size ${fileInfo.size} bytes is too small`),
        };
      }

      if (fileInfo.size > MAX_EPUB_SIZE) {
        warnings.push("This is a very large ePUB file and may take longer to load.");
      }
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    libraryLog.error("Error validating ePUB:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("permission") || errorMessage.includes("Permission")) {
      return {
        valid: false,
        error: new EpubParseError("PERMISSION_DENIED", errorMessage),
      };
    }

    return {
      valid: false,
      error: new EpubParseError("UNKNOWN_ERROR", errorMessage),
    };
  }
};
