import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const lightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#8B4513",
    background: "#FEFEFE",
    card: "#FFFFFF",
    text: "#2C3E50",
    border: "#E8E8E8",
    notification: "#FF6B6B",
  },
};

const darkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#D2691E",
    background: "#1A1A1A",
    card: "#2C2C2C",
    text: "#FFFFFF",
    border: "#404040",
    notification: "#FF6B6B",
  },
};

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function RootLayout() {
  // Hooks
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();

  // State
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Responsive constants
  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  // Font size utility
  const getFontSize = useCallback(
    (base: number) => {
      if (isLargeScreen) return base + 4;
      if (isTablet) return base + 2;
      return base;
    },
    [isLargeScreen, isTablet]
  );

  // Styles
  const styles = useMemo(
    () => createStyles(theme, width, isTablet, getFontSize),
    [theme, width, isTablet, getFontSize]
  );

  // Check token and redirect if needed
  const checkUserToken = useCallback(async () => {
    try {
      setIsCheckingToken(true);
      const token = await AsyncStorage.getItem("userToken");
      setUserToken(token);

      if (token) {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking token:", error);
      setUserToken(null);
      setUser(null);
    } finally {
      setIsCheckingToken(false);
    }
  }, []);

  // Authentication and navigation control
  useEffect(() => {
    checkUserToken().then(() => {
      const inAuthGroup = ["index", "register"].includes(segments[0] as string);
      const inTabsGroup = segments[0] === "(tabs)";

      if (!userToken && !inAuthGroup && !isCheckingToken) {
        router.replace("/");
      } else if (userToken && inAuthGroup && !isCheckingToken) {
        router.replace("/(tabs)/menu");
      }
    });
  }, [userToken, segments, isCheckingToken, router, checkUserToken]);

  // Profile Button Component
  const ProfileButton = useCallback(() => {
    // Don't show profile button in tab layout - it has its own tab
    const inTabsGroup = segments[0] === "(tabs)";
    if (inTabsGroup) return null;

    const handleProfilePress = () => {
      if (userToken) {
        router.push("/(tabs)/profile");
      } else {
        router.push("/");
      }
    };

    return (
      <TouchableOpacity
        onPress={handleProfilePress}
        style={[
          styles.profileButton,
          { backgroundColor: theme.colors.primary },
        ]}
        disabled={isCheckingToken}
      >
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.avatarImage}
            defaultSource={require("../assets/images/default-avatar.png")}
          />
        ) : (
          <Ionicons
            name={userToken ? "person" : "person-outline"}
            size={20}
            color="white"
          />
        )}
      </TouchableOpacity>
    );
  }, [
    user,
    userToken,
    isCheckingToken,
    segments,
    router,
    styles,
    theme.colors.primary,
  ]);

  // Main Layout Render
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
        <Stack
          screenOptions={{
            headerStyle: styles.headerStyle,
            headerTintColor: theme.colors.text,
            headerTitleStyle: styles.headerTitleStyle,
            headerShadowVisible: true,
            animation:
              Platform.OS === "ios" ? "simple_push" : "slide_from_right",
            contentStyle: {
              backgroundColor: theme.colors.background,
              paddingHorizontal: isTablet ? 20 : 0,
            },
            headerRight: () => <ProfileButton />,
            headerTitleAlign: "center",
          }}
        >
          {/* Auth Screens */}
          <Stack.Screen
            name="index"
            options={{
              headerTitle: "Đăng nhập",
              headerRight: () => null,
            }}
          />
          <Stack.Screen
            name="register"
            options={{
              headerTitle: "Đăng ký",
              headerBackTitle: "Trở về",
              presentation: Platform.OS === "ios" ? "modal" : "card",
              headerRight: () => null,
            }}
          />

          {/* Product Detail Screen */}
          <Stack.Screen
            name="details/[id]"
            options={{
              headerTitle: "Chi tiết sản phẩm",
              headerBackTitle: "Trở về",
              presentation: Platform.OS === "ios" ? "card" : "modal",
            }}
          />

          {/* Tab Screens */}
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />

          {/* Error Screen */}
          <Stack.Screen
            name="+not-found"
            options={{
              title: "Không tìm thấy",
              headerStyle: [
                styles.headerStyle,
                { backgroundColor: theme.colors.notification },
              ],
              headerTintColor: "white",
              headerRight: () => null,
            }}
          />
        </Stack>
        <Toast />
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Styles
const createStyles = (
  theme: Theme,
  width: number,
  isTablet: boolean,
  getFontSize: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerStyle: {
      backgroundColor: theme.colors.card,
      shadowColor: theme.colors.text,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    headerTitleStyle: {
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
    profileButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    avatarImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
  });
