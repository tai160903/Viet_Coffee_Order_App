import Loading from "@/components/Loading";
import cartService from "@/services/cart.service";
import { formatCurrency } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// Define the types according to the provided JSON structure
interface ToppingItem {
  topping: string;
  quantity: number;
  price: number;
}

interface Customize {
  id: string;
  note: string;
  size: string;
  product: string;
  price: number;
  extra: number;
  customizeToppings: ToppingItem[];
}

interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  customize: Customize;
}

interface Cart {
  id: string;
  customerId: string;
  totalAmount: number;
  cartItems: CartItem[];
}

export default function CartScreen() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const CART_STORAGE_KEY = "cart";

  useFocusEffect(
    useCallback(() => {
      const loadCartItems = async () => {
        try {
          setLoading(true);
          const storedCart = await cartService.getCart();
          if (storedCart) {
            setCart(storedCart);
            await AsyncStorage.setItem("cart", JSON.stringify(storedCart));
          } else {
            setCart({
              id: "1",
              customerId: "1",
              totalAmount: 0,
              cartItems: [],
            });
          }
        } catch (error) {
          Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: "Không thể tải giỏ hàng. Vui lòng thử lại sau.",
          });
        }
        setLoading(false);
      };

      loadCartItems();
    }, [])
  );

  // Save cart whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (cart && !loading) {
        try {
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (e) {
          console.error("Error saving cart:", e);
        }
      }
    };

    saveCart();
  }, [cart, loading]);

  // Calculate cart totals
  const calculateTotals = useCallback(() => {
    if (!cart?.cartItems?.length) return 0;

    return cart.cartItems.reduce((total, item) => {
      const itemTotal =
        item.quantity * (item.customize.price + item.customize.extra);
      return total + itemTotal;
    }, 0);
  }, [cart]);

  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (!cart) return;

    if (newQuantity < 1) {
      Alert.alert("Xác nhận", "Bạn muốn xóa sản phẩm này khỏi giỏ hàng?", [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          onPress: () => removeItem(itemId),
          style: "destructive",
        },
      ]);
    } else {
      const updatedItems = cart.cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );

      const totalAmount = updatedItems.reduce(
        (sum, item) =>
          sum + (item.customize.price + item.customize.extra) * item.quantity,
        0
      );

      setCart({
        ...cart,
        cartItems: updatedItems,
        totalAmount: totalAmount,
      });
    }
  };

  // Remove item from cart
  const removeItem = (itemId: string) => {
    if (!cart) return;

    const updatedItems = cart.cartItems.filter((item) => item.id !== itemId);
    const totalAmount = updatedItems.reduce(
      (sum, item) =>
        sum + (item.customize.price + item.customize.extra) * item.quantity,
      0
    );

    setCart({
      ...cart,
      cartItems: updatedItems,
      totalAmount: totalAmount,
    });
  };

  const clearCart = async () => {
    if (!cart || cart.cartItems.length === 0) return;
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
          onPress: async () => {
            try {
              await cartService.clearCart();
              Toast.show({
                type: "success",
                text1: "Giỏ hàng đã được xóa",
              });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Không thể xóa giỏ hàng. Vui lòng thử lại sau.",
              });
              return;
            }
            setCart({
              ...cart,
              cartItems: [],
              totalAmount: 0,
            });
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handle checkout process
  const handleCheckout = () => {
    if (!cart || cart.cartItems.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng của bạn đang trống");
      return;
    }

    // Navigate to payment screen with cart total
    router.push({
      pathname: "/payment",
      params: { total: cart.totalAmount.toString() },
    });
  };

  // Render cart item
  const renderItem = ({ item }: { item: CartItem }) => (
    <View
      style={[styles.itemContainer, isTablet && styles.itemContainerTablet]}
    >
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.customize.product}</Text>

        <View style={styles.customizationsContainer}>
          {/* Size */}
          {item.customize.size && (
            <View style={styles.customizationRow}>
              <Text style={styles.customizationLabel}>Size:</Text>
              <Text style={styles.customizationValue}>
                {item.customize.size}
              </Text>
            </View>
          )}

          {/* Toppings */}
          {item.customize.customizeToppings &&
            item.customize.customizeToppings.length > 0 && (
              <View style={styles.toppingsContainer}>
                <Text style={styles.customizationLabel}>Toppings:</Text>
                {item.customize.customizeToppings.map((topping, index) => (
                  <View key={index} style={styles.toppingItem}>
                    <Text style={styles.toppingName}>
                      {topping.topping} x{topping.quantity}
                    </Text>
                    <Text style={styles.toppingPrice}>
                      {formatCurrency(topping.price * topping.quantity)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

          {/* Note */}
          {item.customize.note && (
            <View style={styles.noteContainer}>
              <Text style={styles.customizationLabel}>Ghi chú:</Text>
              <Text style={styles.noteText}>{item.customize.note}</Text>
            </View>
          )}
        </View>

        <Text style={styles.itemPrice}>
          {formatCurrency(item.customize.price)}
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
            cart && cart.cartItems.length > 0 ? (
              <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                <Text style={styles.clearButtonText}>Xóa tất cả</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      {!cart || cart.cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={80} color="#d3d3d3" />
          <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống</Text>
          <TouchableOpacity
            style={styles.continueShopping}
            onPress={() => router.push("/(tabs)/menu")}
          >
            <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(calculateTotals())}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(calculateTotals())}
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
    paddingBottom: 200,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContainerTablet: {
    padding: 20,
    borderRadius: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 6,
  },
  customizationsContainer: {
    marginVertical: 6,
    gap: 6,
  },
  customizationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  customizationLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#636e72",
    marginRight: 4,
  },
  customizationValue: {
    fontSize: 13,
    color: "#2d3436",
  },
  toppingsContainer: {
    marginTop: 4,
  },
  toppingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 12,
    marginTop: 4,
  },
  toppingName: {
    fontSize: 13,
    color: "#2d3436",
  },
  toppingPrice: {
    fontSize: 13,
    color: "#636e72",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
    flexWrap: "wrap",
  },
  noteText: {
    fontSize: 13,
    color: "#636e72",
    fontStyle: "italic",
    flex: 1,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#8B4513",
    marginTop: 8,
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
    minWidth: 24,
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
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
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
    fontSize: 18,
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
    fontWeight: "500",
  },
});
