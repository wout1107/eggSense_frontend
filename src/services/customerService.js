import api from "./api";

const customerService = {
  async listCustomers() {
    try {
      const response = await api.get("/customers");
      return response.data;
    } catch (error) {
      console.error("Error listing customers:", error);
      throw error;
    }
  },

  async getCustomer(id) {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting customer:", error);
      throw error;
    }
  },

  async getCustomerOrders(id) {
    try {
      const response = await api.get(`/customers/${id}/orders`);
      // Backend returns { customerId, orders: [...] }, extract orders array
      return response.data.orders || [];
    } catch (error) {
      console.error("Error getting customer orders:", error);
      throw error;
    }
  },

  async getCustomerStatistics(id) {
    try {
      const response = await api.get(`/customers/${id}/statistics`);
      return response.data;
    } catch (error) {
      console.error("Error getting customer statistics:", error);
      throw error;
    }
  },

  async createCustomer(customerData) {
    try {
      const response = await api.post("/customers", {
        name: customerData.name,
        email: customerData.email || null,
        phone: customerData.phone || null,
        address: customerData.address || null,
        notes: customerData.notes || null,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  async updateCustomer(id, customerData) {
    try {
      const response = await api.put(`/customers/${id}`, {
        name: customerData.name,
        email: customerData.email || null,
        phone: customerData.phone || null,
        address: customerData.address || null,
        notes: customerData.notes || null,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  async deleteCustomer(id) {
    try {
      await api.delete(`/customers/${id}`);
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },
};

export default customerService;
