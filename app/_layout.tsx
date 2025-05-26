import { Ionicons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const lightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#8B4513", // Coffee brown
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

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;

  const getFontSize = (base: number) => {
    if (isLargeScreen) return base + 4;
    if (isTablet) return base + 2;
    return base;
  };

  const currentTheme = colorScheme === "dark" ? darkTheme : lightTheme;

  const styles = createStyles(currentTheme, width, isTablet, getFontSize);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={currentTheme}>
        <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
          <Stack
            screenOptions={{
              headerStyle: styles.headerStyle,
              headerTintColor: currentTheme.colors.text,
              headerTitleStyle: styles.headerTitleStyle,
              headerShadowVisible: true,
              animation:
                Platform.OS === "ios" ? "simple_push" : "slide_from_right",
              contentStyle: {
                backgroundColor: currentTheme.colors.background,
                paddingHorizontal: isTablet ? 20 : 0,
              },
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerTitle: () => (
                  <View style={styles.headerContainer}>
                    <View style={styles.leftSection}>
                      <Text
                        style={[
                          styles.headerTitleStyle,
                          { fontSize: getFontSize(18) },
                        ]}
                      >
                        Việt Coffee
                      </Text>
                    </View>
                    <View style={styles.rightSection}>
                      <TouchableOpacity
                        onPress={() => router.push("/login")}
                        style={[
                          styles.loginButton,
                          { backgroundColor: currentTheme.colors.primary },
                        ]}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="person-outline"
                          size={getFontSize(16)}
                          color="white"
                          style={styles.loginIcon}
                        />
                        <Text
                          style={[
                            styles.loginText,
                            { fontSize: getFontSize(14) },
                          ]}
                        >
                          Đăng nhập
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ),
              }}
            />
            <Stack.Screen
              name="details/[id]"
              options={{
                headerTitle: "Chi tiết sản phẩm",
                headerTitleAlign: "center",
                headerBackTitle: "Trở về",
                presentation: Platform.OS === "ios" ? "card" : "modal",
                headerStyle: [
                  styles.headerStyle,
                  { backgroundColor: currentTheme.colors.card },
                ],
              }}
            />
            <Stack.Screen
              name="cart"
              options={{
                headerTitle: "Giỏ hàng",
                headerTitleAlign: "center",
                headerBackTitle: "Trở về",
                presentation: "modal",
                headerStyle: [
                  styles.headerStyle,
                  { backgroundColor: currentTheme.colors.card },
                ],
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                headerTitle: "Đăng nhập",
                headerTitleAlign: "center",
                headerBackTitle: "Trở về",
                presentation: Platform.OS === "ios" ? "modal" : "card",
                headerStyle: [
                  styles.headerStyle,
                  { backgroundColor: currentTheme.colors.card },
                ],
              }}
            />
            <Stack.Screen
              name="register"
              options={{
                headerTitle: "Đăng ký",
                headerTitleAlign: "center",
                headerBackTitle: "Trở về",
                presentation: Platform.OS === "ios" ? "modal" : "card",
                headerStyle: [
                  styles.headerStyle,
                  { backgroundColor: currentTheme.colors.card },
                ],
              }}
            />
            <Stack.Screen
              name="+not-found"
              options={{
                title: "Không tìm thấy",
                headerTitleAlign: "center",
                headerStyle: [
                  styles.headerStyle,
                  { backgroundColor: currentTheme.colors.notification },
                ],
                headerTintColor: "white",
              }}
            />
          </Stack>
          <StatusBar
            style={colorScheme === "dark" ? "light" : "dark"}
            backgroundColor={currentTheme.colors.card}
          />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

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
      elevation: 4,
      shadowColor: theme.colors.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    headerTitleStyle: {
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
      textAlign: "center",
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: isTablet ? 20 : 16,
    },
    leftSection: {
      flex: 1,
      alignItems: "flex-start",
    },
    rightSection: {
      flex: 1,
      alignItems: "flex-end",
    },
    logoContainer: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      shadowColor: theme.colors.text,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    loginButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isTablet ? 16 : 12,
      paddingVertical: isTablet ? 10 : 8,
      borderRadius: isTablet ? 24 : 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
      minWidth: isTablet ? 140 : 120,
      justifyContent: "center",
    },
    loginIcon: {
      marginRight: 6,
    },
    loginText: {
      color: "white",
      fontWeight: "600",
      fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    },
  });
