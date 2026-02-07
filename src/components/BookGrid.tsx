import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";

import type { BookWithProgress } from "@/src/types";

import { BookCard } from "./BookCard";

interface BookGridProps {
  books: BookWithProgress[];
  onBookPress: (book: BookWithProgress) => void;
  onBookLongPress?: (book: BookWithProgress) => void;
  ListEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  refreshing?: boolean;
  onRefresh?: () => void;
}

// Performance optimizations for FlatList
const WINDOW_SIZE = 5; // Number of items to render outside viewport
const MAX_TO_RENDER_PER_BATCH = 10; // Items rendered per batch
const INITIAL_NUM_TO_RENDER = 8; // Initial items to render

export function BookGrid({ books, onBookPress, onBookLongPress, ListEmptyComponent, ListHeaderComponent, refreshing, onRefresh }: BookGridProps) {
  const { width } = useWindowDimensions();

  // Calculate columns based on screen width
  const minColumnWidth = 140;
  const numColumns = Math.max(2, Math.floor(width / minColumnWidth));
  const columnWidth = (width - 32 - (numColumns - 1) * 12) / numColumns;

  // Memoize item layout calculations for better performance
  const getItemLayout = useMemo(() => {
    // Approximate item height (cover aspect ratio 2:3 + info section)
    const itemHeight = columnWidth * 1.5 + 80; // 1.5 for aspect ratio, 80 for info
    const rowHeight = itemHeight + 12; // 12 for gap

    return (_data: unknown, index: number) => ({
      length: rowHeight,
      offset: rowHeight * Math.floor(index / numColumns),
      index,
    });
  }, [columnWidth, numColumns]);

  // Memoize key extractor
  const keyExtractor = useCallback((item: BookWithProgress) => item.id, []);

  // Memoize render item
  const renderItem = useCallback(
    ({ item }: { item: BookWithProgress }) => (
      <View style={[styles.item, { width: columnWidth }]}>
        <BookCard book={item} onPress={() => onBookPress(item)} onLongPress={onBookLongPress ? () => onBookLongPress(item) : undefined} />
      </View>
    ),
    [columnWidth, onBookPress, onBookLongPress],
  );

  // Memoize column wrapper style
  const columnWrapperStyle = useMemo(() => (numColumns > 1 ? styles.row : undefined), [numColumns]);

  return (
    <FlatList
      data={books}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      key={numColumns} // Force re-render when columns change
      contentContainerStyle={styles.container}
      columnWrapperStyle={columnWrapperStyle}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      // Performance optimizations
      windowSize={WINDOW_SIZE}
      maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
      initialNumToRender={INITIAL_NUM_TO_RENDER}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={50}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  item: {
    flex: 1,
  },
});
