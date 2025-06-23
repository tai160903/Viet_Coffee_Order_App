import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const orderService = {
  getCustomerOrders: async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/Order/get-order-of-customer`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );
      console.log("Customer orders fetched successfully:", response.data.data);
      return response?.data?.data;
    } catch (error: any) {
      console.error("Error fetching customer orders:", error.message);
      throw error;
    }
  },
};

export default orderService;
