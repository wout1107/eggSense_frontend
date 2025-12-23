import api from "./api";

const salesService = {
  async listOrders(filters = {}) {
    try {
      const response = await api.get("/sales", { params: filters });
      // Handle paged response format {content: [...], pageable: {...}}
      const data = response.data;
      return Array.isArray(data) ? data : (data.content || []);
    } catch (error) {
      console.error("Error listing orders:", error);
      return []; // Return empty array on error to prevent crash
    }
  },

  async getOrder(id) {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting order:", error);
      throw error;
    }
  },

  async createOrder(orderData) {
    try {
      const response = await api.post("/sales", {
        customerId: orderData.customerId,
        eggsSmall: orderData.eggsSmall || 0,
        eggsMedium: orderData.eggsMedium || 0,
        eggsLarge: orderData.eggsLarge || 0,
        eggsRejected: orderData.eggsRejected || 0,
        totalPrice: orderData.totalPrice || 0, // 0 triggers auto-calculation
        notes: orderData.notes || null,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  async updateOrder(id, orderData) {
    try {
      const response = await api.put(`/sales/${id}`, {
        customerId: orderData.customerId,
        eggsSmall: orderData.eggsSmall || 0,
        eggsMedium: orderData.eggsMedium || 0,
        eggsLarge: orderData.eggsLarge || 0,
        eggsRejected: orderData.eggsRejected || 0,
        totalPrice: orderData.totalPrice || 0, // 0 triggers auto-calculation
        notes: orderData.notes || null,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  },

  async updateStatus(id, status) {
    try {
      const response = await api.patch(`/sales/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  async deleteOrder(id) {
    try {
      await api.delete(`/sales/${id}`);
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  },
};

export default salesService;
