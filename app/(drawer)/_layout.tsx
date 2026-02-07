import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { useColorScheme } from "react-native";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const DRAWER_ITEMS: { name: string; title: string; icon: IconName }[] = [
  { name: "index", title: "Library", icon: "library-outline" },
  { name: "server", title: "Server", icon: "cloud-outline" },
  { name: "downloads", title: "Downloads", icon: "download-outline" },
  { name: "settings", title: "Settings", icon: "settings-outline" },
];

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    background: isDark ? "#1a1a2e" : "#ffffff",
    card: isDark ? "#16213e" : "#f8f9fa",
    text: isDark ? "#eaeaea" : "#1a1a2e",
    primary: "#e94560",
    border: isDark ? "#2d3748" : "#e2e8f0",
  };

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        drawerStyle: {
          backgroundColor: colors.background,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
        drawerLabelStyle: {
          marginLeft: -20,
          fontSize: 16,
        },
      }}
    >
      {DRAWER_ITEMS.map((item) => (
        <Drawer.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.title,
            drawerIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name={item.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Drawer>
  );
}
