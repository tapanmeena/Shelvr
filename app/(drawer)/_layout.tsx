import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import * as Application from "expo-application";
import { Drawer } from "expo-router/drawer";
import { ComponentProps } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const DRAWER_ITEMS: { name: string; title: string; icon: IconName }[] = [{ name: "index", title: "Library", icon: "library-outline" }];

const appName = Application.applicationName;
const appVersion = Application.nativeApplicationVersion + " | " + Application.nativeBuildVersion;

const CustomDrawerContent = (props: any) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    subtext: isDark ? "#a0a0a0" : "#666666",
  };

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.subtext }]}>
          {appName} v{appVersion}
        </Text>
      </View>
    </View>
  );
};

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
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
  },
});
