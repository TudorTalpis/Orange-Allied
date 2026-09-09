import { config } from "@/lib/config";
import type { AppNotification } from "@/types";
import { http } from "./client";
import { mockLatency } from "./mockDelay";
import { mockStore } from "./mockStore";

export const notificationsApi = {
  /** GET /notifications */
  async list(): Promise<AppNotification[]> {
    if (!config.useMockApi) return http.get<AppNotification[]>("/notifications");
    await mockLatency(150, 320);
    return [...mockStore.notifications].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  /** POST /notifications/:id/read */
  async markRead(id: string): Promise<void> {
    if (!config.useMockApi) {
      await http.post(`/notifications/${id}/read`);
      return;
    }
    await mockLatency(80, 160);
    mockStore.notifications = mockStore.notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    );
  },

  /** POST /notifications/read-all */
  async markAllRead(): Promise<void> {
    if (!config.useMockApi) {
      await http.post("/notifications/read-all");
      return;
    }
    await mockLatency(120, 240);
    mockStore.notifications = mockStore.notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
  },
};
