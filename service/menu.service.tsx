import axios from "axios";

const productService = {
  getMenuList: async () => {
    const resposive = await axios.get("https://viet-cafe.onrender.com/Product");
    return resposive?.data?.data;
  },
  getDetailsProduct: async (id: string) => {
    const response = await axios.get(
      `https://viet-cafe.onrender.com/Product/${id}`
    );
    return response?.data?.data;
  },
};

export default productService;
