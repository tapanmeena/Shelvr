import AsyncStorage from "@react-native-async-storage/async-storage";
import { Book } from "./types";

const STORAGE_KEY = "shelvr_books";

// Retrieve all books from storage. Returns an empty array if no books are stored.
export const getAllBooks = async (): Promise<Book[]> => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  return JSON.parse(json) as Book[];
};

// Persist the full book list to storage
const saveAllBooks = async (books: Book[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(books));
};

// Add a new book to storage and return the updated list of books
export const addBook = async (book: Book): Promise<Book[]> => {
  const books = await getAllBooks();
  books.unshift(book); // Add new book to the beginning of the list
  await saveAllBooks(books);
  return books;
};

export const getBookById = async (id: string): Promise<Book | null> => {
  const books = await getAllBooks();
  return books.find((b) => b.id === id) || null;
};

export const updateBookProgress = async (id: string, cfi: string, progress: number): Promise<void> => {
  const books = await getAllBooks();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return;

  books[index] = {
    ...books[index],
    currentCfi: cfi,
    progress,
    lastReadtAt: new Date().toISOString(),
  };

  await saveAllBooks(books);
};

export const removeBook = async (id: string): Promise<Book[]> => {
  const books = await getAllBooks();
  const updatedBooks = books.filter((b) => b.id !== id);
  await saveAllBooks(updatedBooks);
  return updatedBooks;
};
