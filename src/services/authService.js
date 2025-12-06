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
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
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
      return null;
    }
  },
};

export default authService;
