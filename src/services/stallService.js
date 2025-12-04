import api from "./api";

export const stallService = {
  getAll: async () => {
    const response = await api.get("/stalls");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/stalls/${id}`);
    return response.data;
  },

  create: async (stallData) => {
    const response = await api.post("/stalls", stallData);
    return response.data;
  },

  update: async (id, stallData) => {
    const response = await api.put(`/stalls/${id}`, stallData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/stalls/${id}`);
  },
};
