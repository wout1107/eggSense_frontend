import api, { setToken, removeToken } from "./api";

export const authService = {
  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    if (response.data.token) {
      await setToken(response.data.token);
    }
    return response.data;
  },

  register: async (username, email, password) => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    if (response.data.token) {
      await setToken(response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    // Optional: Call backend logout if needed
    // await api.post('/auth/logout', { refreshToken: ... });
    await removeToken();
  },
};
