import { libraryLog } from "@/src/utils/logger";
import * as FileSystem from "expo-file-system/legacy";
import JSZip from "jszip";

export interface EpubMetadata {
  title: string;
  authors: string[];
  description?: string;
  language?: string;
  publishedDate?: string;
  series?: string;
  seriesIndex?: number;
  coverBase64?: string; // base64-encoded cover image data
  coverMimeType?: string; // e.g. "image/jpeg"
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

// ── Lightweight XML helpers (no external XML parser needed) ──

/** Get the text content of the first matching XML tag */
function getTagContent(xml: string, tagName: string): string | undefined {
  // Match both prefixed (dc:title) and unprefixed tags
  const patterns = [
    new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"),
    new RegExp(`<\\w+:${tagName}[^>]*>([\\s\\S]*?)<\\/\\w+:${tagName}>`, "i"),
  ];
  for (const re of patterns) {
    const match = xml.match(re);
    if (match?.[1]) return match[1].trim();
  }
  return undefined;
}

/** Get all text contents for a repeating XML tag */
function getAllTagContents(xml: string, tagName: string): string[] {
  const results: string[] = [];
  const patterns = [
    new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi"),
    new RegExp(`<\\w+:${tagName}[^>]*>([\\s\\S]*?)<\\/\\w+:${tagName}>`, "gi"),
  ];
  for (const re of patterns) {
    let match;
    while ((match = re.exec(xml)) !== null) {
      const text = match[1].trim();
      if (text && !results.includes(text)) results.push(text);
    }
  }
  return results;
}

/** Get an attribute value from the first matching tag */
function getTagAttribute(xml: string, tagName: string, attrName: string): string | undefined {
  const re = new RegExp(`<${tagName}[^>]*\\s${attrName}=["']([^"']*)["'][^>]*\\/?>`, "i");
  const match = xml.match(re);
  return match?.[1];
}

/** Find all <item> elements and return them as objects */
function parseManifestItems(xml: string): { id: string; href: string; mediaType: string; properties?: string }[] {
  const items: { id: string; href: string; mediaType: string; properties?: string }[] = [];
  const re = /<item\s[^>]*>/gi;
  let match;
  while ((match = re.exec(xml)) !== null) {
    const tag = match[0];
    const id = tag.match(/id=["']([^"']*)["']/i)?.[1];
    const href = tag.match(/href=["']([^"']*)["']/i)?.[1];
    const mediaType = tag.match(/media-type=["']([^"']*)["']/i)?.[1];
    const properties = tag.match(/properties=["']([^"']*)["']/i)?.[1];
    if (id && href && mediaType) {
      items.push({ id, href, mediaType, properties });
    }
  }
  return items;
}

/** Get the content attribute of a <meta> tag by its name attribute */
function getMetaContent(xml: string, metaName: string): string | undefined {
  // <meta name="calibre:series" content="Lord of Mysteries"/>
  const re1 = new RegExp(`<meta[^>]*name=["']${metaName}["'][^>]*content=["']([^"']*)["'][^>]*/?>`, "i");
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${metaName}["'][^>]*/?>`, "i");
  const match = xml.match(re1) || xml.match(re2);
  return match?.[1];
}

/** Strip HTML tags from a string */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Main parser ──

export const parseEpubMetadata = async (epubUri: string): Promise<EpubMetadata> => {
  const fallbackTitle = (epubUri.split("/").pop() || "Unknown").replace(/\.epub$/i, "").replace(/_/g, " ");

  try {
    // Read the epub file as base64 and load with JSZip
    const base64 = await FileSystem.readAsStringAsync(epubUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const zip = await JSZip.loadAsync(base64, { base64: true });

    // 1. Find the OPF path from META-INF/container.xml
    const containerFile = zip.file("META-INF/container.xml");
    if (!containerFile) {
      libraryLog.warn("No container.xml found, using fallback metadata");
      return { title: fallbackTitle, authors: [] };
    }

    const containerXml = await containerFile.async("text");
    const opfPath = getTagAttribute(containerXml, "rootfile", "full-path");
    if (!opfPath) {
      libraryLog.warn("No rootfile path in container.xml");
      return { title: fallbackTitle, authors: [] };
    }

    // 2. Read & parse the OPF file
    const opfFile = zip.file(opfPath);
    if (!opfFile) {
      libraryLog.warn(`OPF file not found at: ${opfPath}`);
      return { title: fallbackTitle, authors: [] };
    }

    const opfXml = await opfFile.async("text");
    const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";

    // 3. Extract metadata
    const title = getTagContent(opfXml, "title") || fallbackTitle;
    const authors = getAllTagContents(opfXml, "creator");
    const rawDescription = getTagContent(opfXml, "description");
    const description = rawDescription ? stripHtml(rawDescription) : undefined;
    const language = getTagContent(opfXml, "language");
    const publishedDate = getTagContent(opfXml, "date");

    const metadata: EpubMetadata = {
      title,
      authors,
      description,
      language,
      publishedDate,
    };

    // 4. Extract series information
    // Strategy A: Calibre metadata (EPUB 2, very common)
    const calibreSeries = getMetaContent(opfXml, "calibre:series");
    const calibreSeriesIndex = getMetaContent(opfXml, "calibre:series_index");
    if (calibreSeries) {
      metadata.series = calibreSeries;
      if (calibreSeriesIndex) {
        const idx = parseFloat(calibreSeriesIndex);
        if (!isNaN(idx)) metadata.seriesIndex = idx;
      }
    }

    // Strategy B: EPUB 3 <meta property="belongs-to-collection">
    if (!metadata.series) {
      const collectionRe = /<meta[^>]*property=["']belongs-to-collection["'][^>]*>([^<]+)<\/meta>/i;
      const collectionMatch = opfXml.match(collectionRe);
      if (collectionMatch?.[1]) {
        metadata.series = collectionMatch[1].trim();
        // Look for group-position for the index
        const posRe = /<meta[^>]*property=["']group-position["'][^>]*>([^<]+)<\/meta>/i;
        const posMatch = opfXml.match(posRe);
        if (posMatch?.[1]) {
          const idx = parseFloat(posMatch[1].trim());
          if (!isNaN(idx)) metadata.seriesIndex = idx;
        }
      }
    }

    // 5. Extract cover image
    const manifestItems = parseManifestItems(opfXml);

    // Strategy A: <item properties="cover-image"> (EPUB 3)
    let coverItem = manifestItems.find((item) => item.properties?.includes("cover-image"));

    // Strategy B: <item properties="cover">
    if (!coverItem) {
      coverItem = manifestItems.find((item) => item.id?.includes("cover"));
    }

    // Strategy C: <meta name="cover" content="cover-id" /> → find item by id (EPUB 2)
    if (!coverItem) {
      const coverMetaRe = /<meta[^>]*name=["']cover["'][^>]*content=["']([^"']*)["'][^>]*\/?>/i;
      const coverMetaRe2 = /<meta[^>]*content=["']([^"']*)["'][^>]*name=["']cover["'][^>]*\/?>/i;
      const coverMetaMatch = opfXml.match(coverMetaRe) || opfXml.match(coverMetaRe2);
      if (coverMetaMatch?.[1]) {
        const coverId = coverMetaMatch[1];
        coverItem = manifestItems.find((item) => item.id === coverId);
      }
    }

    // Strategy D: common cover item id patterns
    if (!coverItem) {
      coverItem = manifestItems.find((item) => item.mediaType.startsWith("image/") && /^(cover|cover-image|coverimage)$/i.test(item.id));
    }

    if (coverItem) {
      try {
        const decodedHref = decodeURIComponent(coverItem.href);
        const coverPath = decodedHref.startsWith("/") ? decodedHref.slice(1) : `${opfDir}${decodedHref}`;
        const coverFile = zip.file(coverPath);
        if (coverFile) {
          const coverData = await coverFile.async("base64");
          metadata.coverBase64 = coverData;
          metadata.coverMimeType = coverItem.mediaType;
          libraryLog.debug(`Extracted cover image (${coverItem.mediaType}) from ${coverPath}`);
        }
      } catch (err) {
        libraryLog.warn("Failed to extract cover image:", err);
      }
    }

    libraryLog.info(`Parsed epub metadata: "${title}" by ${authors.join(", ") || "unknown"}`);
    return metadata;
  } catch (error) {
    libraryLog.error("Error parsing ePUB metadata:", error);
    return { title: fallbackTitle, authors: [] };
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
