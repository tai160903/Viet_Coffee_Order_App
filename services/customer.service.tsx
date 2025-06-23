import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const customerService = {
  getCustomerProfile: async (customerId: string): Promise<any> => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/Customer/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching customer profile:", error);
    }
  },
};

export default customerService;
