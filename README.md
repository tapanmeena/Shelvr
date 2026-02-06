# Shelvr

An Expo-based eBook reader with Komga server integration for managing your digital book library.

## Features

### Local ePUB Reading

- Import and read ePUB files from your device
- Beautiful, customizable reading experience
- Support for various ePUB formats

### Reading Customization

- **Themes**: Light, Dark, and Sepia modes
- **Typography**: Adjustable font size (12-36px)
- **Font Families**: Serif, Sans-serif, Monospace
- **Line Spacing**: Comfortable reading with 1.2x to 2.0x options

### Komga Server Integration

- Connect to your Komga media server
- Browse your book library with cover art
- Download books for offline reading
- Automatic progress synchronization

### Reading Progress Sync

- Track your reading position across devices
- Automatic sync when online
- Offline reading with queued sync
- Conflict resolution for multi-device reading

### Offline Support

- Downloaded books available offline
- Progress synced when connection restored
- Network status indicator in header

## Tech Stack

| Component        | Technology                   |
| ---------------- | ---------------------------- |
| Framework        | Expo SDK 54                  |
| Language         | TypeScript 5.x (strict mode) |
| Navigation       | Expo Router 6.x with Drawer  |
| ePUB Rendering   | @epubjs-react-native/core    |
| State Management | Zustand 4.x                  |
| Database         | expo-sqlite 16.x             |
| File System      | expo-file-system 19.x        |
| HTTP Client      | Axios                        |
| Secure Storage   | expo-secure-store            |

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Shelvr

# Install dependencies
npm install

# Start development server
npx expo start
```

### Running the App

```bash
# iOS (requires macOS)
npx expo run:ios

# Android
npx expo run:android

# Start Expo development server
npx expo start
```

## Project Structure

```
Shelvr/
├── app/                          # Expo Router screens
│   ├── (drawer)/                 # Drawer navigation screens
│   │   ├── index.tsx             # Library screen
│   │   ├── server.tsx            # Server connection screen
│   │   ├── downloads.tsx         # Downloads management
│   │   └── settings.tsx          # App settings
│   ├── reader/[bookId].tsx       # Book reader screen
│   └── _layout.tsx               # Root layout with providers
├── src/
│   ├── components/               # Shared UI components
│   │   ├── BookCard.tsx          # Book display card
│   │   ├── BookGrid.tsx          # Grid layout for books
│   │   ├── ErrorBoundary.tsx     # Global error handling
│   │   └── OfflineIndicator.tsx  # Network status display
│   ├── database/                 # SQLite database layer
│   │   ├── schema.ts             # Table definitions
│   │   ├── useDatabase.tsx       # Database hook
│   │   └── repositories/         # Data access layer
│   ├── features/                 # Feature modules
│   │   ├── komga/                # Komga server integration
│   │   ├── library/              # Local library management
│   │   ├── reader/               # ePUB reader components
│   │   └── sync/                 # Progress synchronization
│   ├── stores/                   # Zustand state stores
│   │   ├── preferencesStore.ts   # Reading preferences
│   │   └── serverStore.ts        # Server connection state
│   └── types/                    # TypeScript definitions
├── __tests__/                    # Test files
│   ├── unit/                     # Unit tests
│   └── integration/              # Integration tests
├── specs/                        # Feature specifications
└── assets/                       # Static assets
```

## Configuration

### Komga Server Setup

1. Open the app and go to **Server** in the drawer menu
2. Enter your Komga server URL (e.g., `https://komga.example.com`)
3. Enter your username and password
4. Tap **Connect**

### Reading Preferences

Customize your reading experience in **Settings**:

- Theme (Light/Dark/Sepia/System)
- Font size
- Font family
- Line spacing

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- epubParser.test.ts
```

### Type Checking

```bash
# Check TypeScript types
npx tsc --noEmit

# Skip library checks for faster checking
npx tsc --noEmit --skipLibCheck
```

### Linting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Komga](https://komga.org/) - Media server for comics/mangas/BDs/ebooks
- [epub.js](https://github.com/futurepress/epub.js/) - JavaScript library for rendering ePUB documents
- [Expo](https://expo.dev/) - Platform for universal native apps
