import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Helper to get token safely on web vs native
const getToken = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem("userToken");
  } else {
    return await SecureStore.getItemAsync("userToken");
  }
};

// Helper to set token
export const setToken = async (token) => {
  if (Platform.OS === "web") {
    localStorage.setItem("userToken", token);
  } else {
    await SecureStore.setItemAsync("userToken", token);
  }
};

// Helper to remove token
export const removeToken = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem("userToken");
  } else {
    await SecureStore.deleteItemAsync("userToken");
  }
};

// Base URL from environment or default
const API_BASE_URL = "http://192.168.0.202:8080/api";
// const API_BASE_URL =
//   process.env.EXPO_PUBLIC_API_BASE || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add Auth Token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Trigger logout or refresh token logic here
      await removeToken();
    }
    return Promise.reject(error);
  }
);

export default api;
