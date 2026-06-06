import apiClient from "@/src/v1/api/api-client";
import type { NotificationItem } from "@/src/v1/types/response/notification";
import type { PaginatedResponse } from "@/src/v1/types/response/api";

export const notificationApi = {
  getAll: async (cursor?: string | null): Promise<PaginatedResponse<NotificationItem>> => {
    const res = await apiClient.get("/users/notifications", {
      params: cursor ? { cursor } : {},
    });
    return res.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/users/notifications/${id}`);
  },
};