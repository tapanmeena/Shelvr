import { runMigrations } from "@/src/database/migrations";
import { dbLog } from "@/src/utils/logger";
import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const DATABASE_NAME = "shelvr.db";

let globalDbInstance: SQLiteDatabase | null = null;

export const getGlobalDatabase = (): SQLiteDatabase | null => {
  return globalDbInstance;
};

interface DatabaseContextValue {
  db: SQLiteDatabase | null;
  isReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  isReady: false,
  error: null,
});

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider = ({ children }: DatabaseProviderProps) => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let database: SQLiteDatabase | null = null;

    const initDatabase = async () => {
      try {
        dbLog.debug("Opening database...");
        database = await openDatabaseAsync(DATABASE_NAME);

        dbLog.debug("Running migrations...");
        await runMigrations(database);

        globalDbInstance = database;

        setDb(database);
        setIsReady(true);
        dbLog.info("Database ready");
      } catch (err) {
        dbLog.error("Initialized failed:", err);
        setError(err instanceof Error ? err : new Error("Database initialization failed"));
      }
    };

    initDatabase();

    return () => {
      if (database) {
        dbLog.debug("Closing database...");
        globalDbInstance = null;
        database.closeAsync();
      }
    };
  }, []);

  return <DatabaseContext.Provider value={{ db, isReady, error }}>{children}</DatabaseContext.Provider>;
};

// Hook for accessing the database
export const useDatabase = (): SQLiteDatabase => {
  const { db, isReady, error } = useContext(DatabaseContext);

  if (error) {
    throw error;
  }

  if (!isReady || !db) {
    throw new Error("Database is not ready.");
  }

  return db;
};

// Database status hook
export const useDatabaseStatus = (): {
  isReady: boolean;
  error: Error | null;
} => {
  const { isReady, error } = useContext(DatabaseContext);
  return { isReady, error };
};
