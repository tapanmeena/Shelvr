import { DatabaseProvider } from "@/src/database/useDatabase";
import {
  usePreferencesStore,
  useTamaguiThemeName,
  useThemeColors,
} from "@/src/stores/preferencesStore";
import { tamaguiConfig } from "@/src/theme";
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

function AppContent() {
  const themeName = useTamaguiThemeName();
  const colors = useThemeColors();
  useOnboardingRedirect();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={themeName}>
      <DatabaseProvider>
        <StatusBar style="auto" />
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

export default function RootLayout() {
  const colors = useThemeColors();

  const rootStyle = useMemo(
    () => [styles.container, { backgroundColor: colors.background }],
    [colors.background],
  );

  return (
    <GestureHandlerRootView style={rootStyle}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
