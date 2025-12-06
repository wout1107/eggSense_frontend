import api from "./api";

const customerService = {
  getAll: async (search) => {
    const params = search ? { search } : {};
    const response = await api.get("/customers", { params });
    return response.data;
  },

  // Alias for listCustomers used in SalesScreen
  listCustomers: async (search) => {
    const params = search ? { search } : {};
    const response = await api.get("/customers", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (customerData) => {
    const response = await api.post("/customers", customerData);
    return response.data;
  },

  // Alias for createCustomer used in SalesScreen
  createCustomer: async (customerData) => {
    const response = await api.post("/customers", customerData);
    return response.data;
  },

  update: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/customers/${id}`);
  },
};

export { customerService };
export default customerService;
