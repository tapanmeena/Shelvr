import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerTintColor: "#000000",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "My Library",
        }}
      />
      <Stack.Screen
        name="reader/[bookId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
