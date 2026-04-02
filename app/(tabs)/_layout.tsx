import { useThemeColors } from "@/src/stores/preferencesStore";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ComponentProps, useMemo } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface TabItem {
  name: string;
  title: string;
  icon: IconName;
  iconFocused: IconName;
}

const TAB_ITEMS: TabItem[] = [
  { name: "index", title: "Home", icon: "home-outline", iconFocused: "home" },
  {
    name: "library",
    title: "Library",
    icon: "library-outline",
    iconFocused: "library",
  },
  {
    name: "shelves",
    title: "Shelves",
    icon: "layers-outline",
    iconFocused: "layers",
  },
];

export default function TabLayout() {
  const colors = useThemeColors();

  const screenOptions = useMemo(
    () => ({
      headerShown: false as const,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        borderTopWidth: 0.5,
        elevation: 0,
        height: 85,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: "500" as const,
      },
    }),
    [colors],
  );

  return (
    <Tabs screenOptions={screenOptions}>
      {TAB_ITEMS.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? item.iconFocused : item.icon}
                size={24}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
