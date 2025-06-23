import orderService from "@/services/order.service";
import { formatCurrency } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StatusBar as RNStatusBar,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
}

const statusColors = {
  pending: "#F59E0B", // Amber
  processing: "#3B82F6", // Blue
  completed: "#10B981", // Green
  cancelled: "#EF4444", // Red
  new: "#8B4513", // Brown
};

const statusMessages = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        Alert.alert("Thông báo", "Vui lòng đăng nhập để xem đơn hàng");
        router.replace("/");
        return;
      }

      const response = await orderService.getCustomerOrders();
      setOrders(response);
      if (!response || response.length === 0) {
        setOrders(generateSampleOrders());
      }
      console.log("Fetched orders:", response);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders(generateSampleOrders());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  // Format date to Vietnamese format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Ngày không hợp lệ";
      }

      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Ngày không hợp lệ";
    }
  };

  // Generate sample orders for development
  const generateSampleOrders = (): Order[] => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    return [
      {
        id: "1",
        orderNumber: "VC-001235",
        createdAt: now.toISOString(),
        items: [
          {
            id: "101",
            name: "Cà phê sữa đá",
            quantity: 2,
            price: 29000,
            image: "https://example.com/cafe-sua-da.jpg",
          },
          {
            id: "102",
            name: "Bạc xỉu đá",
            quantity: 1,
            price: 35000,
            image: "https://example.com/bac-xiu.jpg",
          },
        ],
        total: 93000,
        status: "completed",
      },
      {
        id: "2",
        orderNumber: "VC-001236",
        createdAt: oneDayAgo.toISOString(),
        items: [
          {
            id: "103",
            name: "Trà đào cam sả",
            quantity: 3,
            price: 45000,
            image: "https://example.com/tra-dao.jpg",
          },
        ],
        total: 135000,
        status: "processing",
      },
      {
        id: "3",
        orderNumber: "VC-001237",
        createdAt: twoDaysAgo.toISOString(),
        items: [
          {
            id: "104",
            name: "Cà phê đen đá",
            quantity: 1,
            price: 25000,
            image: "https://example.com/cafe-den.jpg",
          },
          {
            id: "105",
            name: "Matcha đá xay",
            quantity: 1,
            price: 55000,
            image: "https://example.com/matcha.jpg",
          },
        ],
        total: 80000,
        status: "pending",
      },
      {
        id: "4",
        orderNumber: "VC-001238",
        createdAt: fiveDaysAgo.toISOString(),
        items: [
          {
            id: "106",
            name: "Sinh tố bơ",
            quantity: 2,
            price: 49000,
            image: "https://example.com/sinh-to-bo.jpg",
          },
        ],
        total: 98000,
        status: "cancelled",
      },
    ];
  };

  // Render an order card
  const renderOrder = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => {
          // router.push(`/order/${item.id}`);
          Alert.alert("Chi tiết đơn hàng", `Đơn hàng #${item.orderNumber}`);
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderNumberContainer}>
            <Text style={styles.orderNumberLabel}>Đơn hàng</Text>
            <Text style={styles.orderNumber}>#{item.code || "VC-00000"}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusColors[
                    item?.status?.toLowerCase() as keyof typeof statusColors
                  ],
              },
            ]}
          >
            <Text style={styles.statusText}>
              {statusMessages[
                item?.status?.toLowerCase() as keyof typeof statusMessages
              ] || "Mới"}
            </Text>
          </View>
        </View>

        <View style={styles.orderTime}>
          <Ionicons name="time-outline" size={16} color="#64748B" />
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.itemsContainer}>
          {item?.orderItems?.map((orderItem: any) => (
            <View key={orderItem.id} style={styles.orderItem}>
              {orderItem.imageProduct ? (
                <Image
                  source={{ uri: orderItem?.imageProduct }}
                  style={styles.itemImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="cafe-outline" size={16} color="#64748B" />
                </View>
              )}

              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{orderItem.name}</Text>
                <Text style={styles.itemQuantity}>x{orderItem.quantity}</Text>
              </View>

              <Text style={styles.itemPrice}>
                {formatCurrency(orderItem.unitPrice * orderItem.quantity)}
              </Text>
            </View>
          ))}

          {item?.items?.length > 2 && (
            <Text style={styles.moreItems}>
              +{item?.items?.length - 2} sản phẩm khác
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(item?.finalPrice)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading indicator
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </SafeAreaView>
    );
  }

  // Empty state
  if (!loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={60} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
        <Text style={styles.emptyDescription}>
          Bạn chưa có đơn hàng nào. Hãy đặt món yêu thích của bạn để thưởng thức
          ngay!
        </Text>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => router.push("/(tabs)/menu")}
        >
          <Text style={styles.orderButtonText}>Đặt hàng ngay</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#8B4513"]}
            tintColor="#8B4513"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  listContainer: {
    padding: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  orderButton: {
    backgroundColor: "#8B4513",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  orderButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderNumberLabel: {
    fontSize: 14,
    color: "#64748B",
    marginRight: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  orderTime: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  itemsContainer: {
    gap: 12,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  itemQuantity: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  moreItems: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    fontStyle: "italic",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
});
