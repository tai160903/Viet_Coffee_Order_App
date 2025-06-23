import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

interface OrderDetails {
  id: string;
  orderCode: string;
  status: string;
  pickupTime?: string;
  deliveryAddress?: string;
  totalAmount: number;
  paymentMethod: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export default function OrderSuccessScreen() {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any | null>(null);
  const params = useLocalSearchParams();
  const { orderId } = params;

  useEffect(() => {
    const getOrderDetails = async () => {
      try {
        setLoading(true);
        // Try to get order from AsyncStorage using the orderId from params
        const orderData = await AsyncStorage.getItem(`order`);
        console.log("Fetching order details for orderId:", orderData);
        if (orderData) {
          setOrder(JSON.parse(orderData));
        } else {
          console.error("Order data not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setLoading(false);
      }
    };

    getOrderDetails();
  }, []);

  console.log("Order details:", order);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#4CAF50";
      case "processing":
        return "#2196F3";
      case "preparing":
        return "#FF9800";
      case "ready":
        return "#8BC34A";
      default:
        return "#757575";
    }
  };

  const handleNavigateToHome = () => {
    router.replace("/(tabs)/home");
  };

  const handleViewOrderDetails = () => {
    // router.push({
    //   pathname: "/(tabs)/orders/[id]",
    //   params: { id: order?.id },
    // });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorTitle}>Không tìm thấy thông tin đơn hàng</Text>
        <Text style={styles.errorMessage}>
          Có thể đã xảy ra lỗi trong quá trình xử lý. Vui lòng kiểm tra lại sau.
        </Text>
        <Pressable style={styles.primaryButton} onPress={handleNavigateToHome}>
          <Text style={styles.primaryButtonText}>Quay về trang chủ</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.successHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>
        <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
        <Text style={styles.successSubtitle}>
          Cảm ơn bạn đã đặt hàng tại Viet Coffee
        </Text>
      </View>

      <View style={styles.orderInfoCard}>
        <Text style={styles.cardTitle}>Thông tin đơn hàng</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
          <Text style={styles.infoValue}>{order.orderCode}</Text>
        </View>

        <View>
          <Text style={styles.infoLabel}>Sản phẩm đã đặt:</Text>
          <View style={{ marginBottom: 12, marginStart: 8 }}>
            {order?.orderItems?.map((item: any, index: number) => (
              <View key={index} style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {item.name} (x{item.quantity}):
                </Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(item.unitPrice * item.quantity)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trạng thái:</Text>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            />
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        {order.pickupTime ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian nhận:</Text>
            <Text style={styles.infoValue}>{order.pickupTime}</Text>
          </View>
        ) : null}

        {order.deliveryAddress ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa chỉ giao hàng:</Text>
            <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phương thức thanh toán:</Text>
          <Text style={styles.infoValue}>{order.paymentMethod}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(order.totalAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.qrCodeContainer}>
        <Text style={styles.qrCodeTitle}>Mã QR đơn hàng</Text>
        <Text style={styles.qrCodeDescription}>
          Xuất trình mã QR này khi đến lấy đơn hàng
        </Text>
        <View style={styles.qrCode}>
          <QRCode
            value={`VIETCOFFEE:ORDER:${order.orderCode}`}
            size={200}
            color="#2C3E50"
            backgroundColor="#FFFFFF"
            logoBackgroundColor="transparent"
          />
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={styles.primaryButton}
          onPress={handleViewOrderDetails}
        >
          <Text style={styles.primaryButtonText}>Xem chi tiết đơn hàng</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={handleNavigateToHome}
        >
          <Text style={styles.secondaryButtonText}>Quay về trang chủ</Text>
        </Pressable>
      </View>

      {/* <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Cần hỗ trợ?</Text>
        <Link href="/support" asChild>
          <Pressable style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={20} color="#8B4513" />
            <Text style={styles.helpButtonText}>Liên hệ CSKH</Text>
          </Pressable>
        </Link>
      </View> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8F8F8",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: "#333",
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    color: "#666",
  },
  successHeader: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  iconContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 50,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  orderInfoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 17,
    color: "#8B4513",
    fontWeight: "bold",
    textAlign: "right",
  },
  qrCodeContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  qrCodeDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  qrCode: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 8,
  },
  buttonsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#8B4513",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8B4513",
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#8B4513",
    fontWeight: "bold",
    fontSize: 16,
  },
  helpSection: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    alignItems: "center",
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 12,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 69, 19, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B4513",
    marginLeft: 8,
  },
});
