import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const authService = {
  async login(username, password) {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      if (response.data) {
        await AsyncStorage.setItem("user", JSON.stringify(response.data));
        if (response.data.token) {
          await AsyncStorage.setItem("token", response.data.token);
        }
        // Store refreshToken if provided by the backend
        if (response.data.refreshToken) {
          await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
        }
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(
        error.response?.data?.message || "Ongeldige inloggegevens"
      );
    }
  },

  async logout() {
    try {
      // Get the refreshToken from storage
      const refreshToken = await AsyncStorage.getItem("refreshToken");

      // Call the backend logout endpoint with the refreshToken
      await api.post("/auth/logout", {
        refreshToken: refreshToken || "",
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with local cleanup even if backend logout fails
    } finally {
      // Always clean up local storage
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("refreshToken");
    }
  },

  async checkAuth() {
    try {
      const user = await AsyncStorage.getItem("user");
      if (!user) return null;

      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Check auth error:", error);
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("refreshToken");
      return null;
    }
  },

  async getRefreshToken() {
    return await AsyncStorage.getItem("refreshToken");
  },
};

export default authService;

