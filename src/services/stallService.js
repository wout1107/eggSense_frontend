import api from "./api";

const stallService = {
  async listStalls() {
    try {
      const response = await api.get("/stalls");
      return response.data;
    } catch (error) {
      console.error("Error listing stalls:", error);
      throw error;
    }
  },

  async getStall(id) {
    try {
      const response = await api.get(`/stalls/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting stall:", error);
      throw error;
    }
  },

  async createStall(stallData) {
    try {
      const response = await api.post("/stalls", {
        name: stallData.name,
        breed: stallData.breed || null,
        capacity: stallData.capacity,
        initialChickenCount:
          stallData.initialChickenCount || stallData.capacity, // Default to capacity if not specified
        notes: stallData.notes || null,
        active: stallData.active !== undefined ? stallData.active : true,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating stall:", error);
      throw error;
    }
  },

  async updateStall(id, stallData) {
    try {
      const response = await api.put(`/stalls/${id}`, {
        name: stallData.name,
        breed: stallData.breed || null,
        capacity: stallData.capacity,
        notes: stallData.notes || null,
        active: stallData.active !== undefined ? stallData.active : true,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating stall:", error);
      throw error;
    }
  },

  async deleteStall(id) {
    try {
      await api.delete(`/stalls/${id}`);
    } catch (error) {
      console.error("Error deleting stall:", error);
      throw error;
    }
  },
};

export default stallService;
