import api from "./api";

const productionService = {
  upsert: async (productionData) => {
    const response = await api.post("/daily-productions", productionData);
    return response.data;
  },

  listProduction: async (params = {}) => {
    try {
      const response = await api.get("/daily-productions", { params });
      return response.data || [];
    } catch (error) {
      console.error("Error listing production:", error);
      return [];
    }
  },

  createDailyProduction: async (productionData) => {
    const response = await api.post("/daily-productions", productionData);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/daily-productions/${id}`);
    return response.data;
  },

  listForStall: async (stallId) => {
    const response = await api.get(`/daily-productions/stall/${stallId}`);
    return response.data;
  },

  getByDate: async (date, stallId) => {
    const response = await api.get("/daily-productions/by-date", {
      params: { date, stallId },
    });
    return response.data;
  },

  getDailyProduction: async (date, stallId) => {
    try {
      const response = await api.get("/daily-productions/by-date", {
        params: { date, stallId },
      });
      return response.data;
    } catch (error) {
      // If 404, return null (no production for that date)
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getDifference: async (id) => {
    const response = await api.get(`/daily-productions/${id}/difference`);
    return response.data;
  },
};

export { productionService };
export default productionService;
