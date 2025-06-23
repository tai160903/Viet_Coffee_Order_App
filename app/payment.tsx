"use client";

import { paymentService } from "@/services/payment.service";
import { formatCurrency } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
  size?: string;
  note?: string;
  extra?: number;
  customizeToppings?: any[];
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

// Define order types
type OrderType = "delivery" | "pickup";

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

// Store opening and closing hours
const STORE_OPENING_HOUR = 10; // 10 AM
const STORE_CLOSING_HOUR = 20; // 8 PM

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

  // Enhanced state for order type and pickup date/time
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [pickupDateTime, setPickupDateTime] = useState<Date>(
    getDefaultPickupTime()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Calculate total with delivery fee (only if delivery is selected)
  const deliveryFee =
    orderType === "pickup"
      ? 0
      : subtotal > FREE_DELIVERY_THRESHOLD
      ? 0
      : DELIVERY_FEE;
  const total = subtotal + deliveryFee - promoDiscount;

  // Function to get default pickup time (current time + 30 minutes, rounded to nearest 15 min)
  function getDefaultPickupTime() {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;

    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    now.setMilliseconds(0);

    // Add 30 minutes for preparation time
    now.setMinutes(now.getMinutes() + 30);

    // Check if within store hours
    if (now.getHours() < STORE_OPENING_HOUR) {
      now.setHours(STORE_OPENING_HOUR);
      now.setMinutes(0);
    } else if (now.getHours() >= STORE_CLOSING_HOUR) {
      // If after closing, set to opening time tomorrow
      now.setDate(now.getDate() + 1);
      now.setHours(STORE_OPENING_HOUR);
      now.setMinutes(0);
    }

    return now;
  }

  // Format date for display
  const formatPickupDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Ngày mai";
    } else {
      return date.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  // Format time for display
  const formatPickupTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Check if pickup date/time is valid
  const isValidPickupDateTime = (date: Date) => {
    const now = new Date();
    const hour = date.getHours();

    // Check if date is in the past
    if (date < now) {
      return false;
    }

    // Check store hours
    if (hour < STORE_OPENING_HOUR || hour >= STORE_CLOSING_HOUR) {
      return false;
    }

    // If today, time must be at least 30 minutes from now
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);
      if (date < thirtyMinutesFromNow) {
        return false;
      }
    }

    // Don't allow pickup more than 7 days in advance
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    if (date > maxDate) {
      return false;
    }

    return true;
  };

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (selectedDate) {
      // Keep the current time but update the date
      const newDateTime = new Date(pickupDateTime);
      newDateTime.setFullYear(selectedDate.getFullYear());
      newDateTime.setMonth(selectedDate.getMonth());
      newDateTime.setDate(selectedDate.getDate());

      if (isValidPickupDateTime(newDateTime)) {
        setPickupDateTime(newDateTime);
      } else {
        // If the new date/time combination is invalid, set to default time for that date
        const defaultTime = new Date(selectedDate);
        defaultTime.setHours(STORE_OPENING_HOUR);
        defaultTime.setMinutes(0);
        defaultTime.setSeconds(0);
        defaultTime.setMilliseconds(0);

        if (isValidPickupDateTime(defaultTime)) {
          setPickupDateTime(defaultTime);
        } else {
          Alert.alert(
            "Ngày không hợp lệ",
            "Vui lòng chọn ngày trong vòng 7 ngày tới."
          );
        }
      }
    }
  };

  // Handle time change
  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);

    if (selectedTime) {
      // Keep the current date but update the time
      const newDateTime = new Date(pickupDateTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      newDateTime.setSeconds(0);
      newDateTime.setMilliseconds(0);

      if (isValidPickupDateTime(newDateTime)) {
        setPickupDateTime(newDateTime);
      } else {
        Alert.alert(
          "Thời gian không hợp lệ",
          `Vui lòng chọn thời gian từ ${STORE_OPENING_HOUR}:00 đến ${STORE_CLOSING_HOUR}:00 và ít nhất 30 phút từ bây giờ.`
        );
      }
    }
  };

  // Get minimum date for date picker (today)
  const getMinimumDate = () => {
    return new Date();
  };

  // Get maximum date for date picker (7 days from now)
  const getMaximumDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return maxDate;
  };

  // Load cart items and user data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const cartData = await AsyncStorage.getItem("cart");

        if (cartData) {
          const parsedCart = JSON.parse(cartData);

          // Transform the cart data to match our CartItem interface
          const transformedItems: CartItem[] =
            parsedCart.cartItems?.map((item: any) => ({
              id: item.id,
              name: item.customize.product,
              price: item.customize.price,
              quantity: item.quantity,
              size: item.customize.size,
              note: item.customize.note,
              extra: item.customize.extra,
              customizeToppings: item.customize.customizeToppings,
            })) || [];

          setCartItems(transformedItems);

          // Calculate subtotal from the transformed items
          const calculatedSubtotal = transformedItems.reduce(
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
      if (subtotal < FREE_DELIVERY_THRESHOLD && orderType === "delivery") {
        setPromoDiscount(DELIVERY_FEE);
        setPromoApplied(true);
        Alert.alert("Thành công", "Đã áp dụng mã FREESHIP: miễn phí giao hàng");
      } else {
        Alert.alert("Thông báo", "Đơn hàng của bạn đã được miễn phí giao hàng");
      }
    } else {
      Alert.alert("Lỗi", "Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
    }
  }, [promoCode, subtotal, orderType]);

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

    if (orderType === "delivery" && !deliveryAddress.address.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ giao hàng");
      return false;
    }

    if (orderType === "pickup" && !isValidPickupDateTime(pickupDateTime)) {
      Alert.alert("Lỗi", "Vui lòng chọn thời gian nhận hàng hợp lệ");
      return false;
    }

    return true;
  }, [deliveryAddress, orderType, pickupDateTime]);

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
        fullName: deliveryAddress.fullName,
        phoneNumber: deliveryAddress.phone,
        address: deliveryAddress.address,
      };

      switch (selectedPayment) {
        case "cash":
          const response = await paymentService.payWithCash(order);
          console.log("Cash payment response:", response.data);
          AsyncStorage.removeItem("cart");
          const existingOrderHistory = await AsyncStorage.getItem("order");
          if (existingOrderHistory) {
            await AsyncStorage.removeItem("order");
          }
          await AsyncStorage.setItem(
            "order",
            JSON.stringify(response.data.data)
          );

          if (response.status !== 200) {
            throw new Error("Thanh toán bằng tiền mặt không thành công");
          }
          router.push("/order-success");
          break;
        case "cash_wallet":
          const walletResponse = await paymentService.payWithWallet(order);
          console.log("Wallet payment response:", walletResponse);
          if (walletResponse.status !== 200) {
            throw new Error("Thanh toán bằng ví tiền mặt không thành công");
          }
          router.push("/order-success");
          break;
        case "payos":
          break; // Handle PayOS payment separately
        default:
          break;
      }
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Lỗi", "Không thể đặt hàng. Vui lòng thử lại sau.");
    } finally {
      setIsProcessing(false);
    }
  }, [deliveryAddress, selectedPayment, validateForm, router]);
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
                    <View style={styles.orderItemInfo}>
                      <Text style={styles.orderItemName}>{item.name}</Text>
                      {item.size && (
                        <Text style={styles.orderItemSize}>
                          Size: {item.size}
                        </Text>
                      )}
                      {item.note && (
                        <Text style={styles.orderItemNote}>
                          Ghi chú: {item.note}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.orderItemPrice}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Order Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức nhận hàng</Text>
            <View style={styles.orderTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.orderTypeButton,
                  orderType === "delivery" && styles.selectedOrderType,
                ]}
                onPress={() => setOrderType("delivery")}
              >
                <Ionicons
                  name="bicycle-outline"
                  size={24}
                  color={orderType === "delivery" ? "#8B4513" : "#64748B"}
                />
                <Text
                  style={[
                    styles.orderTypeText,
                    orderType === "delivery" && styles.selectedOrderTypeText,
                  ]}
                >
                  Giao hàng
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.orderTypeButton,
                  orderType === "pickup" && styles.selectedOrderType,
                ]}
                onPress={() => setOrderType("pickup")}
              >
                <Ionicons
                  name="storefront-outline"
                  size={24}
                  color={orderType === "pickup" ? "#8B4513" : "#64748B"}
                />
                <Text
                  style={[
                    styles.orderTypeText,
                    orderType === "pickup" && styles.selectedOrderTypeText,
                  ]}
                >
                  Tự đến lấy
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pickup Date & Time Selection - Only show if pickup is selected */}
          {orderType === "pickup" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thời gian nhận hàng</Text>
              <View style={styles.pickupTimeContainer}>
                <Text style={styles.pickupTimeLabel}>
                  Chọn ngày và thời gian nhận hàng:
                </Text>

                {/* Date Selection */}
                <View style={styles.dateTimeRow}>
                  <View style={styles.dateTimeItem}>
                    <Text style={styles.dateTimeItemLabel}>Ngày</Text>
                    <TouchableOpacity
                      style={styles.dateTimeButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <View style={styles.dateTimeButtonContent}>
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#8B4513"
                        />
                        <Text style={styles.dateTimeButtonText}>
                          {formatPickupDate(pickupDateTime)}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-down-outline"
                        size={16}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Time Selection */}
                  <View style={styles.dateTimeItem}>
                    <Text style={styles.dateTimeItemLabel}>Giờ</Text>
                    <TouchableOpacity
                      style={styles.dateTimeButton}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <View style={styles.dateTimeButtonContent}>
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color="#8B4513"
                        />
                        <Text style={styles.dateTimeButtonText}>
                          {formatPickupTime(pickupDateTime)}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-down-outline"
                        size={16}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Date Picker */}
                {showDatePicker && (
                  <DateTimePicker
                    value={pickupDateTime}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    minimumDate={getMinimumDate()}
                    maximumDate={getMaximumDate()}
                  />
                )}

                {/* Time Picker */}
                {showTimePicker && (
                  <DateTimePicker
                    value={pickupDateTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    minimumDate={new Date(Date.now() + 30 * 60000)}
                    onChange={onTimeChange}
                  />
                )}

                <View style={styles.pickupInfoContainer}>
                  <View style={styles.pickupInfoRow}>
                    <Ionicons
                      name="information-circle-outline"
                      size={16}
                      color="#64748B"
                    />
                    <Text style={styles.pickupInfoText}>
                      Giờ hoạt động: {STORE_OPENING_HOUR}:00 -{" "}
                      {STORE_CLOSING_HOUR}:00
                    </Text>
                  </View>
                  <View style={styles.pickupInfoRow}>
                    <Ionicons name="time-outline" size={16} color="#64748B" />
                    <Text style={styles.pickupInfoText}>
                      Thời gian chuẩn bị: tối thiểu 30 phút
                    </Text>
                  </View>
                  <View style={styles.pickupInfoRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#64748B"
                    />
                    <Text style={styles.pickupInfoText}>
                      Có thể đặt trước tối đa 7 ngày
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Delivery Address - Only show if delivery is selected */}
          {orderType === "delivery" && (
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
          )}

          {/* Contact Info - For pickup orders */}
          {orderType === "pickup" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
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
            </View>
          )}

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
              {orderType === "delivery" && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Phí giao hàng</Text>
                  <Text style={styles.totalValue}>
                    {deliveryFee > 0 ? formatCurrency(deliveryFee) : "Miễn phí"}
                  </Text>
                </View>
              )}
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
  // Order type styles
  orderTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  orderTypeButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  selectedOrderType: {
    borderColor: "#8B4513",
    backgroundColor: "#FFF8F0",
  },
  orderTypeText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  selectedOrderTypeText: {
    color: "#8B4513",
    fontWeight: "600",
  },
  // Enhanced pickup time styles
  pickupTimeContainer: {
    marginTop: 8,
  },
  pickupTimeLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeItemLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
    fontWeight: "500",
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateTimeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateTimeButtonText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  pickupInfoContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pickupInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  pickupInfoText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 8,
    flex: 1,
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
  orderItemInfo: {
    flex: 1,
  },
  orderItemSize: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  orderItemNote: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontStyle: "italic",
  },
});
