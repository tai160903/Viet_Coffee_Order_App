import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

// Define the coffee theme colors
const coffeeTheme = {
  light: {
    primary: "#8B4513", // Coffee brown
    background: "#FFFFFF",
    card: "#F8F8F8",
    text: "#2C3E50",
    border: "#E8E8E8",
    tabBarActive: "#8B4513",
    tabBarInactive: "#8D8D8D",
    tabBarBackground: "#FFFFFF",
  },
  dark: {
    primary: "#D2691E",
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    border: "#2C2C2C",
    tabBarActive: "#D2691E",
    tabBarInactive: "#A0A0A0",
    tabBarBackground: "#121212",
  },
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? coffeeTheme.dark : coffeeTheme.light;
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          const decoded = jwtDecode<any>(token);
          setUserRole(decoded?.role || null);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setUserRole(null);
      }
    };

    checkAuth();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.border,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: theme.card,
          shadowColor: theme.text,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          elevation: 4,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerTitle: "Viet Coffee",
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: "Thực đơn",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cafe-outline" size={size} color={color} />
          ),
          headerTitle: "Thực đơn",
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Đơn hàng",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
          headerTitle: "Đơn hàng của bạn",
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Giỏ hàng",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
          headerTitle: "Giỏ hàng",
          tabBarBadgeStyle: {
            backgroundColor: "#FF6B6B",
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          headerTitle: "Thông tin cá nhân",
        }}
      />
    </Tabs>
  );
}
