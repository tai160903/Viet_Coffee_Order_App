import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from "expo-router";
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
    primary: "#D2691E", // Lighter coffee brown for dark mode
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

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Check auth status and cart items when component mounts
  useEffect(() => {
    const checkAuthAndCart = async () => {
      try {
        // Check auth status
        const token = await AsyncStorage.getItem("userToken");
        setIsLoggedIn(!!token);

        // Check cart items count
        const cartData = await AsyncStorage.getItem("cart");
        if (cartData) {
          const cart = JSON.parse(cartData);
          const count = cart.items?.length || 0;
          setCartCount(count);
        }
      } catch (error) {
        console.error("Error checking auth or cart:", error);
      }
    };

    checkAuthAndCart();

    // You could also set up an event listener to update cart count when it changes
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
      {/* Home Tab - New Addition */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
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
          tabBarBadge: cartCount > 0 ? cartCount : undefined, // Only show badge when items exist
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
