import api from "./api";

const stallService = {
  getAll: async () => {
    const response = await api.get("/stalls");
    return response.data;
  },

  // Alias for listStalls used in screens
  listStalls: async () => {
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

  // Alias for createStall used in screens
  createStall: async (stallData) => {
    const response = await api.post("/stalls", stallData);
    return response.data;
  },

  update: async (id, stallData) => {
    const response = await api.put(`/stalls/${id}`, stallData);
    return response.data;
  },

  // Alias for updateStall used in screens
  updateStall: async (id, stallData) => {
    const response = await api.put(`/stalls/${id}`, stallData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/stalls/${id}`);
  },

  // Alias for deleteStall used in screens
  deleteStall: async (id) => {
    await api.delete(`/stalls/${id}`);
  },
};

export { stallService };
export default stallService;
