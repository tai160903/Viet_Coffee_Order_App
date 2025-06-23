// axiosInstance.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}`,
  timeout: 10000,
});

// Gắn token trước mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = AsyncStorage.getItem("userToken"); // hoặc từ Redux, etc.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tự động refresh token nếu hết hạn
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      !error.config._retry &&
      (await AsyncStorage.getItem("refreshToken"))
    ) {
      error.config._retry = true;
      try {
        const res = await axios.post(
          "https://your-api-url.com/api/auth/refresh",
          {
            refreshToken: localStorage.getItem("refreshToken"),
          }
        );
        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(error.config);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
