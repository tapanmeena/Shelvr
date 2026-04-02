import {
  DatabaseProvider,
  useDatabaseStatus,
} from "@/src/database/useDatabase";
import {
  usePreferencesStore,
  useTamaguiThemeName,
  useThemeColors,
} from "@/src/stores/preferencesStore";
import { tamaguiConfig } from "@/src/theme";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";

function useOnboardingRedirect() {
  const router = useRouter();
  const segments = useSegments();
  const isHydrated = usePreferencesStore((s) => s.isHydrated);
  const hasCompletedOnboarding = usePreferencesStore(
    (s) => s.hasCompletedOnboarding,
  );
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;

    const isOnOnboarding = (segments as string[])[0] === "onboarding";

    if (!hasCompletedOnboarding && !isOnOnboarding && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace("/onboarding" as any);
    } else if (
      hasCompletedOnboarding &&
      isOnOnboarding &&
      !hasNavigated.current
    ) {
      hasNavigated.current = true;
      router.replace("/(tabs)" as any);
    }
  }, [isHydrated, hasCompletedOnboarding]);
}

/** Navigates to the last-read book once DB is ready. Runs inside DatabaseProvider. */
function useReopenLastBook() {
  const router = useRouter();
  const { isReady: dbReady } = useDatabaseStatus();
  const isHydrated = usePreferencesStore((s) => s.isHydrated);
  const hasCompletedOnboarding = usePreferencesStore(
    (s) => s.hasCompletedOnboarding,
  );
  const reopenLastBookOnLaunch = usePreferencesStore(
    (s) => s.reopenLastBookOnLaunch,
  );
  const lastOpenedBookId = usePreferencesStore((s) => s.lastOpenedBookId);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!isHydrated || !dbReady || !hasCompletedOnboarding) return;

    console.log("[ReopenBook] ready:", {
      reopenLastBookOnLaunch,
      lastOpenedBookId,
      hasNavigated: hasNavigated.current,
    });

    if (reopenLastBookOnLaunch && lastOpenedBookId && !hasNavigated.current) {
      console.log("[ReopenBook] navigating to reader:", lastOpenedBookId);
      hasNavigated.current = true;
      router.push(`/reader/${lastOpenedBookId}` as any);
    }
  }, [isHydrated, dbReady, hasCompletedOnboarding]);
}

function AppContent() {
  const themeName = useTamaguiThemeName();
  const colors = useThemeColors();
  const currentTheme = usePreferencesStore((s) => s.theme);
  const statusBarStyle =
    currentTheme === "dark" || currentTheme === "midnight" ? "light" : "dark";
  useOnboardingRedirect();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={themeName}>
      <DatabaseProvider>
        <ReopenLastBookGate />
        <StatusBar style={statusBarStyle} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="reader/[bookId]"
            options={{
              presentation: "fullScreenModal",
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="shelf/[shelfId]"
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
      </DatabaseProvider>
    </TamaguiProvider>
  );
}

/** Renderless component that runs useReopenLastBook inside DatabaseProvider */
function ReopenLastBookGate() {
  useReopenLastBook();
  return null;
}

export default function RootLayout() {
  const colors = useThemeColors();

  const rootStyle = useMemo(
    () => [styles.container, { backgroundColor: colors.background }],
    [colors.background],
  );

  return (
    <GestureHandlerRootView style={rootStyle}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
