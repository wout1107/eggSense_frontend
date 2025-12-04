import api from "./api";

export const feedService = {
  create: async (feedData) => {
    const response = await api.post("/feed-deliveries", feedData);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/feed-deliveries/${id}`);
    return response.data;
  },

  list: async (stallId, start, end) => {
    const params = { stallId };
    if (start) params.start = start;
    if (end) params.end = end;
    const response = await api.get("/feed-deliveries", { params });
    return response.data;
  },

  getInventory: async (stallId) => {
    const response = await api.get(
      `/feed-deliveries/stall/${stallId}/inventory`
    );
    return response.data;
  },
};
