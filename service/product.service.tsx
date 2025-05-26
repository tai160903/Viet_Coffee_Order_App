import axios from "axios";

const productService = {
  getMenuList: async () => {
    const resposive = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/Product`
    );
    return resposive?.data?.data;
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
};

export default productService;
