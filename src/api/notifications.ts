import { gatewayClient } from "./client";

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getMyNotifications = async (page = 1, limit = 20) => {
  const response = await gatewayClient.get<NotificationsResponse>(
    "/notifications/me",
    { params: { page, limit } },
  );
  return response.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await gatewayClient.get<{ count: number }>(
    "/notifications/unread-count",
  );
  return response.data.count;
};

export const markAsRead = async (id: string) => {
  const response = await gatewayClient.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await gatewayClient.patch("/notifications/mark-all-read");
  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await gatewayClient.delete(`/notifications/${id}`);
  return response.data;
};
