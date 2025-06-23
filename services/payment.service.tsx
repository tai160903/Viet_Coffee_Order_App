import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const paymentService = {
  payWithCash: async (data: any): Promise<any> => {
    const token = await AsyncStorage.getItem("userToken");
    console.log("Token:", token);
    console.log("Payment data:", data);
    const response: any = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/Payment/payment-by-cash`,
      {
        ...data,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  },
  payWithWallet: async (data: any): Promise<any> => {
    const token = await AsyncStorage.getItem("userToken");
    const response: any = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/Payment/payment-by-wallet`,
      {
        ...data,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
