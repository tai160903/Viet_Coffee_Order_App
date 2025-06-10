import { formatCurrency } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Define types
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cash",
    name: "Tiền mặt",
    icon: "cash-outline",
    description: "Thanh toán khi nhận hàng (COD)",
  },
  {
    id: "cash_wallet",
    name: "Ví tiền mặt",
    icon: "wallet-outline",
    description: "Thanh toán từ ví tiền trong ứng dụng",
  },
  {
    id: "payos",
    name: "PayOS",
    icon: "card-outline",
    description: "Thanh toán nhanh qua QR với PayOS",
  },
];

const DELIVERY_FEE = 15000; // 15,000 VND delivery fee
const FREE_DELIVERY_THRESHOLD = 100000; // Free delivery for orders over 100,000 VND

export default function PaymentScreen() {
  const router = useRouter();
  const { total: totalParam } = useLocalSearchParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<string>("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: "",
    phone: "",
    address: "",
  });
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  // Calculate total with delivery fee
  const deliveryFee = subtotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee - promoDiscount;

  // Load cart items and user data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load cart items
        const cartData = await AsyncStorage.getItem("cart");
        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          setCartItems(parsedCart.items || []);

          // Calculate subtotal
          const calculatedSubtotal = parsedCart.items.reduce(
            (sum: number, item: CartItem) => sum + item.price * item.quantity,
            0
          );
          setSubtotal(calculatedSubtotal);
        }

        // Load user data for delivery address
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user.deliveryAddress) {
            setDeliveryAddress(user.deliveryAddress);
          } else if (user.name && user.phone) {
            setDeliveryAddress({
              ...deliveryAddress,
              fullName: user.name,
              phone: user.phone,
            });
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApplyPromo = useCallback(() => {
    // Simple promo code validation logic - you would connect to your backend for real validation
    if (promoCode.toUpperCase() === "WELCOME10") {
      const discount = Math.round(subtotal * 0.1); // 10% off
      setPromoDiscount(discount);
      setPromoApplied(true);
      Alert.alert("Thành công", "Đã áp dụng mã giảm giá WELCOME10: giảm 10%");
    } else if (promoCode.toUpperCase() === "FREESHIP") {
      if (subtotal < FREE_DELIVERY_THRESHOLD) {
        setPromoDiscount(DELIVERY_FEE);
        setPromoApplied(true);
        Alert.alert("Thành công", "Đã áp dụng mã FREESHIP: miễn phí giao hàng");
      } else {
        Alert.alert("Thông báo", "Đơn hàng của bạn đã được miễn phí giao hàng");
      }
    } else {
      Alert.alert("Lỗi", "Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
    }
  }, [promoCode, subtotal]);

  const validateForm = useCallback(() => {
    if (!deliveryAddress.fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên người nhận");
      return false;
    }

    if (
      !deliveryAddress.phone.trim() ||
      !/^[0-9]{10}$/.test(deliveryAddress.phone)
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ (10 số)");
      return false;
    }

    if (!deliveryAddress.address.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ giao hàng");
      return false;
    }

    return true;
  }, [deliveryAddress]);

  const handlePlaceOrder = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setIsProcessing(true);

      // Save delivery address to user data for future use
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        user.deliveryAddress = deliveryAddress;
        await AsyncStorage.setItem("user", JSON.stringify(user));
      }

      // Create order object
      const order = {
        items: cartItems,
        subtotal,
        deliveryFee,
        discount: promoDiscount,
        total,
        paymentMethod: selectedPayment,
        deliveryAddress,
        orderDate: new Date().toISOString(),
        status: "pending",
        orderNumber: `VC-${Math.floor(100000 + Math.random() * 900000)}`, // Generate random order number
      };

      // In a real app, send this to your backend
      console.log("Order placed:", order);

      // Save order to local storage history
      const ordersHistory = await AsyncStorage.getItem("orders");
      let orders = ordersHistory ? JSON.parse(ordersHistory) : [];
      orders.unshift(order); // Add new order at the beginning
      await AsyncStorage.setItem("orders", JSON.stringify(orders));

      // Clear the cart
      await AsyncStorage.setItem("cart", JSON.stringify({ items: [] }));

      // Show success message
      setTimeout(() => {
        setIsProcessing(false);
        Alert.alert(
          "Đặt hàng thành công",
          `Cảm ơn bạn đã đặt hàng! Mã đơn hàng: ${order.orderNumber}`,
          [
            {
              text: "Xem đơn hàng",
              onPress: () => router.replace("/(tabs)/orders"),
            },
            {
              text: "Tiếp tục mua sắm",
              onPress: () => router.replace("/(tabs)/menu"),
            },
          ]
        );
      }, 1500);
    } catch (error) {
      console.error("Error placing order:", error);
      setIsProcessing(false);
      Alert.alert("Lỗi", "Không thể đặt hàng. Vui lòng thử lại sau.");
    }
  }, [
    cartItems,
    subtotal,
    deliveryFee,
    promoDiscount,
    total,
    selectedPayment,
    deliveryAddress,
    router,
  ]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Đang tải thông tin thanh toán...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerTitle: "Thanh toán",
          headerBackTitle: "Trở về",
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
            <View style={styles.orderSummary}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <View style={styles.orderItemDetails}>
                    <Text style={styles.orderItemQuantity}>
                      x{item.quantity}
                    </Text>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                  </View>
                  <Text style={styles.orderItemPrice}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                value={deliveryAddress.fullName}
                onChangeText={(text) =>
                  setDeliveryAddress({ ...deliveryAddress, fullName: text })
                }
                placeholder="Nguyễn Văn A"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={deliveryAddress.phone}
                onChangeText={(text) =>
                  setDeliveryAddress({ ...deliveryAddress, phone: text })
                }
                placeholder="0912345678"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Địa chỉ</Text>
              <TextInput
                style={[styles.input, styles.addressInput]}
                value={deliveryAddress.address}
                onChangeText={(text) =>
                  setDeliveryAddress({ ...deliveryAddress, address: text })
                }
                placeholder="Số nhà, đường, quận/huyện, thành phố"
                multiline
              />
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={styles.paymentMethods}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    selectedPayment === method.id && styles.selectedPayment,
                  ]}
                  onPress={() => setSelectedPayment(method.id)}
                >
                  <Ionicons
                    name={method.icon as any}
                    size={24}
                    color={
                      selectedPayment === method.id ? "#8B4513" : "#64748B"
                    }
                  />
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>{method.name}</Text>
                    <Text style={styles.paymentDescription}>
                      {method.description}
                    </Text>
                  </View>
                  {selectedPayment === method.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#8B4513"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Promo Code */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mã khuyến mãi</Text>
            <View style={styles.promoContainer}>
              <TextInput
                style={styles.promoInput}
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Nhập mã khuyến mãi"
                editable={!promoApplied}
              />
              <TouchableOpacity
                style={[
                  styles.promoButton,
                  promoApplied && styles.promoButtonDisabled,
                ]}
                onPress={handleApplyPromo}
                disabled={promoApplied || !promoCode}
              >
                <Text style={styles.promoButtonText}>
                  {promoApplied ? "Đã áp dụng" : "Áp dụng"}
                </Text>
              </TouchableOpacity>
            </View>
            {promoApplied && (
              <TouchableOpacity
                style={styles.removePromoButton}
                onPress={() => {
                  setPromoCode("");
                  setPromoDiscount(0);
                  setPromoApplied(false);
                }}
              >
                <Text style={styles.removePromoText}>Xóa mã khuyến mãi</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Order Total */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng thanh toán</Text>
            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tạm tính</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Phí giao hàng</Text>
                <Text style={styles.totalValue}>
                  {deliveryFee > 0 ? formatCurrency(deliveryFee) : "Miễn phí"}
                </Text>
              </View>
              {promoDiscount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Giảm giá</Text>
                  <Text style={styles.discountValue}>
                    -{formatCurrency(promoDiscount)}
                  </Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.grandTotalLabel}>Tổng cộng</Text>
                <Text style={styles.grandTotalValue}>
                  {formatCurrency(total)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Place Order Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.placeOrderButtonText}>Đặt hàng</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 12,
  },
  orderSummary: {
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  orderItemDetails: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  orderItemQuantity: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginRight: 8,
  },
  orderItemName: {
    fontSize: 14,
    color: "#334155",
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: "#334155",
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  selectedPayment: {
    borderColor: "#8B4513",
    backgroundColor: "#FFF8F0",
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  paymentDescription: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  promoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  promoInput: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: "#334155",
  },
  promoButton: {
    backgroundColor: "#8B4513",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  promoButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  promoButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  removePromoButton: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
  removePromoText: {
    color: "#8B4513",
    fontSize: 14,
  },
  totalContainer: {
    gap: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  totalValue: {
    fontSize: 14,
    color: "#334155",
  },
  discountValue: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
  footer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  placeOrderButton: {
    backgroundColor: "#8B4513",
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  placeOrderButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
