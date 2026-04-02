# Shelvr — Feature Roadmap

## Phase 1: Technical Foundation & Cleanup

> Unblocks everything else, zero user-facing risk

| ID  | Feature                                                                                                          | Effort  |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------- |
| E1  | Wire `ErrorBoundary` around component tree                                                                       | Small   |
| E2  | Remove unused deps (`@react-navigation/drawer`, `expo-application`, `expo-constants`, `expo-linking`, `expo-system-ui`, `react-native-worklets`) | Small   |
| E3  | Switch library search to DB-level `repository.searchBooks()`                                                     | Small   |
| E4  | Fix code typos (`"Curretn"`, `"fromd atabase"`, `"Runn all"`)                                                    | Trivial |
| C2  | Wire `reopenLastBookOnLaunch` preference (store exists, just needs reading)                                      | Small   |

---

## Phase 2: Reader Essentials

> Core reading gaps that users notice immediately

| ID  | Feature                                                         | Effort |
| --- | --------------------------------------------------------------- | ------ |
| A1  | Highlights & annotations (multi-color, notes, per-book list)    | Large  |
| A2  | Bookmarks (add/remove/list/jump)                                | Medium |
| A8  | Page number display ("Page X of Y" alongside %)                 | Small  |
| D3  | Margin/padding controls in reader settings                      | Small  |
| D4  | Text alignment options (justify / left / center)                | Small  |

---

## Phase 3: Library & Organization

> Complete the half-built scaffolding

| ID  | Feature                                       | Effort |
| --- | --------------------------------------------- | ------ |
| B1  | List view mode for library                    | Medium |
| B5  | Book detail screen (full metadata view)       | Medium |
| B3  | Shelf customization (icon + color picker)     | Small  |
| B4  | Shelf reordering (drag-to-reorder)            | Medium |
| B2  | Smart shelves with auto-population rules      | Large  |
| B6  | Series grouping with ordering                 | Medium |

---

## Phase 4: Reader Power Features

> Polish and power-user capabilities

| ID  | Feature                                    | Effort |
| --- | ------------------------------------------ | ------ |
| A4  | Brightness slider (in-app control)         | Small  |
| A7  | Dictionary/lookup on text selection         | Medium |
| A5  | Reading statistics (time, pages/day, streak) | Medium |
| A3  | Page flip animations (curl / slide)        | Medium |
| A9  | Dual-page mode for landscape               | Medium |
| A6  | Auto-scroll mode with speed control        | Medium |

---

## Phase 5: Theming & Fonts

> Visual customization

| ID  | Feature                                       | Effort |
| --- | --------------------------------------------- | ------ |
| D1  | Custom fonts (load `.ttf`/`.otf` from device) | Medium |
| D2  | Blue light filter (warm tint overlay)          | Small  |

---

## Phase 6: Sync, Data & Advanced

> Ecosystem features

| ID  | Feature                                            | Effort |
| --- | -------------------------------------------------- | ------ |
| B7  | Batch operations (multi-select, bulk actions)      | Medium |
| C1  | Cloud backup/restore (Google Drive or file export) | Large  |
| C3  | OPDS catalog support (browse + download)           | Large  |
