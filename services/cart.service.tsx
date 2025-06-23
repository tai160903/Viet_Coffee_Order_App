import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const cartService = {
  addToCart: async (addToCartForm: any) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/Cart/add-customize-to-cart`,
        addToCartForm,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );
      return response?.data?.data;
    } catch (error: any) {
      console.error("Error adding to cart:", error.message);
      throw error;
    }
  },

  getCart: async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/Cart/get-cart-by-customer`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );
      console.log("Cart fetched successfully:", response.data.data);
      return response?.data?.data;
    } catch (error: any) {
      console.error("Error fetching cart:", error.message);
      throw error;
    }
  },

  deleteCartItem: async (cartItemId: string) => {
    try {
      console.log("Deleting cart item with ID:", cartItemId);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/Cart/delete-cart-item`,
        { cartItemId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );
      console.log("Cart item deleted successfully:", response.data);
      return response?.data?.data;
    } catch (error: any) {
      console.error("Error deleting cart item:", error.message);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/Cart/clear-cart`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );
      console.log("Cart cleared successfully:", response.data);
      return response?.data?.data;
    } catch (error: any) {
      console.error("Error clearing cart:", error.message);
      throw error;
    }
  },
};

export default cartService;
