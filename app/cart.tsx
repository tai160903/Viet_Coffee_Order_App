import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// Cart item type definition - fixed structure
type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  customizations?: {
    size?: {
      id: string;
      name: string;
      extraPrice: number;
    };
    sugar?: string;
    ice?: string;
    milk?: string;
    toppings?: string[];
  };
};

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const CART_STORAGE_KEY = "@cart_items";

  useFocusEffect(
    useCallback(() => {
      const loadCartItems = async () => {
        try {
          const cart = await AsyncStorage.getItem(CART_STORAGE_KEY);
          if (cart != null) {
            setCartItems(JSON.parse(cart));
          }
        } catch (e) {
          console.error("Error loading cart items:", e);
        } finally {
          setLoading(false);
        }
      };

      loadCartItems();
    }, [])
  );

  useEffect(() => {
    const saveCartItems = async () => {
      try {
        const cart = JSON.stringify(cartItems);
        await AsyncStorage.setItem(CART_STORAGE_KEY, cart);
      } catch (e) {
        console.error("Error saving cart items:", e);
      }
    };

    if (!loading) {
      saveCartItems();
    }
  }, [cartItems, loading]);

  // Calculate total price of all items in cart
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Handle item quantity update
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // Show confirmation before removing
      Alert.alert("Xác nhận", "Bạn muốn xóa sản phẩm này khỏi giỏ hàng?", [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          onPress: () => {
            setCartItems(cartItems.filter((item) => item.id !== id));
          },
          style: "destructive",
        },
      ]);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    Alert.alert("Xác nhận", "Bạn chắc chắn muốn xóa sản phẩm này?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        onPress: () => {
          setCartItems(cartItems.filter((item) => item.id !== id));
        },
        style: "destructive",
      },
    ]);
  };

  // Clear entire cart
  const clearCart = () => {
    if (cartItems.length === 0) return;

    Alert.alert(
      "Xác nhận",
      "Bạn chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa tất cả",
          onPress: () => {
            setCartItems([]);
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    Alert.alert(
      "Đặt hàng thành công",
      "Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn sẽ sớm được xử lý!",
      [
        {
          text: "OK",
          onPress: () => {
            setCartItems([]);
            router.push("/");
          },
        },
      ]
    );
  };

  // Render each cart item
  const renderItem = ({ item }: { item: CartItem }) => (
    <View
      style={[styles.itemContainer, isTablet && styles.itemContainerTablet]}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>

        {/* Display customizations if any - fixed */}
        {item.customizations && (
          <View style={styles.customizationsContainer}>
            {item.customizations.size && (
              <Text style={styles.customizationText}>
                Size: {item.customizations.size.name}
              </Text>
            )}
            {item.customizations.sugar && (
              <Text style={styles.customizationText}>
                Đường: {item.customizations.sugar}
              </Text>
            )}
            {item.customizations.ice && (
              <Text style={styles.customizationText}>
                Đá: {item.customizations.ice}
              </Text>
            )}
            {item.customizations.milk && (
              <Text style={styles.customizationText}>
                Sữa: {item.customizations.milk}
              </Text>
            )}
            {item.customizations.toppings &&
              item.customizations.toppings.length > 0 && (
                <Text style={styles.customizationText}>
                  Topping: {item.customizations.toppings.join(", ")}
                </Text>
              )}
          </View>
        )}

        <Text style={styles.itemPrice}>
          {item.price.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </Text>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color="#8B4513" />
        </TouchableOpacity>

        <Text style={styles.quantityText}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color="#8B4513" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  // Handle different states (loading, empty cart)
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Giỏ hàng",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Giỏ hàng",
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () =>
            cartItems.length > 0 ? (
              <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                <Text style={styles.clearButtonText}>Xóa tất cả</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={80} color="#d3d3d3" />
          <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống</Text>
          <TouchableOpacity
            style={styles.continueShopping}
            onPress={() => router.push("/")}
          >
            <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>
                {totalPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>
                {totalPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <Text style={styles.checkoutButtonText}>Đặt hàng</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="white"
                style={styles.checkoutIcon}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8B4513",
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#636e72",
    marginTop: 20,
    marginBottom: 20,
  },
  continueShopping: {
    backgroundColor: "#8B4513",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
  },
  continueShoppingText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 250 : 230, // Fixed extra space for the summary container
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContainerTablet: {
    padding: 16,
    borderRadius: 16,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 4,
  },
  customizationsContainer: {
    marginVertical: 4,
  },
  customizationText: {
    fontSize: 12,
    color: "#636e72",
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#8B4513",
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f3f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  removeButton: {
    padding: 8,
  },
  summaryContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#2d3436",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3436",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#dfe6e9",
    paddingTop: 12,
    marginTop: 6,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3436",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
  checkoutButton: {
    marginTop: 20,
    backgroundColor: "#8B4513",
    paddingVertical: 14,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  checkoutIcon: {
    marginLeft: 4,
  },
  clearButton: {
    marginRight: 16,
  },
  clearButtonText: {
    color: "#FF6B6B",
    fontWeight: "600",
    fontSize: 14,
  },
});
