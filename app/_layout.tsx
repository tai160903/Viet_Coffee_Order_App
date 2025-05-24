import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, useWindowDimensions } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { width } = useWindowDimensions();

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "right", "left"]}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: "#f8f9fa",
              },
              headerTintColor: "#2d3436",
              headerTitleStyle: {
                fontWeight: "bold",
              },
              headerShadowVisible: false,
              animation: "slide_from_right",
              contentStyle: { backgroundColor: "#f8f9fa" },
              headerLargeTitle: width >= 768,
              headerLargeTitleShadowVisible: false,
              headerRight: () => (
                <TouchableOpacity
                  onPress={() =>
                    alert("Login functionality will be implemented soon!")
                  }
                  style={{
                    backgroundColor: "#0984e3",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "500" }}>
                    Login
                  </Text>
                </TouchableOpacity>
              ),
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerTitle: "Việt Coffee",
                headerLargeTitle: true,
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() =>
                      alert("Login functionality will be implemented soon!")
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#0984e3",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      marginRight: 8,
                    }}
                  >
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color="white"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={{ color: "white", fontWeight: "500" }}>
                      Login
                    </Text>
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="details/[id]"
              options={{
                headerTitle: "Customize Order",
                headerBackTitle: "Menu",
                presentation: "card",
              }}
            />
            <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
          </Stack>
          <StatusBar style="dark" />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
