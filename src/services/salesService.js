import api from "./api";

const salesService = {
  getAll: async (params) => {
    // params: { start, end, status }
    const response = await api.get("/sales", { params });
    return response.data;
  },

  // Alias for listOrders used in SalesScreen
  listOrders: async (params) => {
    const response = await api.get("/sales", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  create: async (saleData) => {
    const response = await api.post("/sales", saleData);
    return response.data;
  },

  // Alias for createOrder used in SalesScreen
  createOrder: async (saleData) => {
    const response = await api.post("/sales", saleData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/sales/${id}/status`, { status });
    return response.data;
  },
};

export { salesService };
export default salesService;
