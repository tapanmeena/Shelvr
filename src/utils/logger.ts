import * as FileSystem from "expo-file-system/legacy";
import { consoleTransport, fileAsyncTransport, logger } from "react-native-logs";
const isDev = __DEV__;

const log = logger.createLogger({
  severity: isDev ? "debug" : "warn",
  transport: isDev ? consoleTransport : fileAsyncTransport,
  transportOptions: {
    colors: {
      debug: "white",
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
    },
    FS: FileSystem,
    fileName: "shelvr_logs.txt",
  },
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  dateFormat: "iso",
  printDate: true,
  printLevel: true,
  enabled: true,
  async: true,
});

export { log };

// Named logs
export const dbLog = log.extend("database");
export const readerLog = log.extend("reader");
export const libraryLog = log.extend("library");
