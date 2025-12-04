import api from "./api";

export const productionService = {
  upsert: async (productionData) => {
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

  getDifference: async (id) => {
    const response = await api.get(`/daily-productions/${id}/difference`);
    return response.data;
  },
};
