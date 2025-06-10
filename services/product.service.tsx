import axios from "axios";

const productService = {
  getMenuList: async () => {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/Product`
    );
    return response?.data?.data;
  },
  getDetailsProduct: async (id: string) => {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/Product/${id}`
    );
    return response?.data?.data;
  },
  getAllSizes: async () => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/Size`);
    return response?.data?.data;
  },

  getAllToppings: async () => {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/Topping`
    );
    return response?.data?.data;
  },
};

export default productService;
