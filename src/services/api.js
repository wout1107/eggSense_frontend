import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Network options:
// - Docker/K8s with nginx proxy: use "/api" (via EXPO_PUBLIC_API_BASE env var)
// - iOS Simulator: use "http://localhost:8080/api"
// - Physical device (same network): use "http://YOUR_IP:8080/api"
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;
