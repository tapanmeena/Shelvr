export interface Book {
  id: string;
  title: string;
  fileUri: string;
  fileName: string;
  addedAt: string;
  lastReadtAt: string | null;
  progress: number;
  currentCfi: string | null;
}
