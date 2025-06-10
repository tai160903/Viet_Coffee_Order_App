import Loading from "@/components/Loading";
import { CartItem } from "@/interfaces/cart.interface";
import { formatCurrency } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const CART_STORAGE_KEY = "cart";

  useFocusEffect(
    useCallback(() => {
      const loadCartItems = async () => {
        try {
          const cart = await AsyncStorage.getItem(CART_STORAGE_KEY);
          if (cart != null) {
            const parsedCart = JSON.parse(cart);
            if (Array.isArray(parsedCart)) {
              setCartItems(parsedCart);
            } else {
              console.error("Invalid cart data format");
              setCartItems([]);
            }
          } else {
            setCartItems([]);
          }
        } catch (e) {
          console.error("Error loading cart items:", e);
          Alert.alert(
            "Error",
            "Could not load your cart items. Please try again."
          );
          setCartItems([]);
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
        // Fixed: only save if not loading
        if (!loading) {
          await AsyncStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cartItems)
          );
        }
      } catch (e) {
        console.error("Error saving cart items:", e);
        Alert.alert(
          "Error",
          "Could not save your cart changes. Please try again."
        );
      }
    };

    saveCartItems();
  }, [cartItems, loading]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
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
            AsyncStorage.removeItem(CART_STORAGE_KEY).catch((e) =>
              console.error("Error clearing cart:", e)
            );
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng của bạn đang trống");
      return;
    }

    Alert.alert(
      "Đặt hàng thành công",
      "Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn sẽ sớm được xử lý!",
      [
        {
          text: "OK",
          onPress: () => {
            setCartItems([]);
            AsyncStorage.removeItem(CART_STORAGE_KEY);
            router.push("/");
          },
        },
      ]
    );
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    const extra = item.customize.extra || 0;
    return sum + (item.customize.price + extra) * item.quantity;
  }, 0);

  const renderItem = ({ item }: { item: CartItem }) => (
    <View
      style={[styles.itemContainer, isTablet && styles.itemContainerTablet]}
    >
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.customize.product}</Text>

        {item.customize && (
          <View style={styles.customizationsContainer}>
            {item.customize.size && (
              <Text style={styles.customizationText}>
                Size: {item.customize.size}
              </Text>
            )}
            {item.customize.customizeToppings &&
              item.customize.customizeToppings.length > 0 && (
                <Text style={styles.customizationText}>
                  Topping:{" "}
                  {item.customize.customizeToppings.map(
                    (topping) => `${topping.topping} (${topping.quantity})`
                  )}
                </Text>
              )}
          </View>
        )}

        {/* Display note if available */}
        {item.customize.note && (
          <Text style={styles.customizationText}>
            Ghi chú: {item.customize.note}
          </Text>
        )}

        <Text style={styles.itemPrice}>
          {formatCurrency(
            (item.customize.price + (item.customize.extra || 0)) * item.quantity
          )}
        </Text>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => item.id && updateQuantity(item.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color="#8B4513" />
        </TouchableOpacity>

        <Text style={styles.quantityText}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => item.id && updateQuantity(item.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color="#8B4513" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => item.id && removeItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Loading type="fullscreen" />
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
            keyExtractor={(item) => item.id || Math.random().toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(totalPrice)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(totalPrice)}
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
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#8B4513",
    borderRadius: 6,
    marginHorizontal: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3436",
  },
  removeButton: {
    padding: 8,
  },
  summaryContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 4,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#636e72",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3436",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3436",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
  },
  checkoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8B4513",
    paddingVertical: 14,
    borderRadius: 25,
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  checkoutIcon: {
    marginLeft: 4,
  },
  clearButton: {
    marginRight: 12,
  },
  clearButtonText: {
    color: "#FF6B6B",
    fontSize: 14,
  },
});
