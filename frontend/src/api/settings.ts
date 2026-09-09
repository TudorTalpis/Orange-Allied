import { config } from "@/lib/config";
import type { AppSettings, DeviceSession } from "@/types";
import { mockSessions } from "@/data/mockUser";
import { http } from "./client";
import { mockLatency } from "./mockDelay";
import { mockStore } from "./mockStore";

export const settingsApi = {
  /** GET /settings */
  async get(): Promise<AppSettings> {
    if (!config.useMockApi) return http.get<AppSettings>("/settings");
    await mockLatency(200, 420);
    return mockStore.settings;
  },

  /** PUT /settings */
  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    if (!config.useMockApi) return http.put<AppSettings>("/settings", patch);

    await mockLatency(280, 560);
    mockStore.settings = {
      ...mockStore.settings,
      ...patch,
      ai: { ...mockStore.settings.ai, ...patch.ai },
      processing: { ...mockStore.settings.processing, ...patch.processing },
      appearance: { ...mockStore.settings.appearance, ...patch.appearance },
      notifications: { ...mockStore.settings.notifications, ...patch.notifications },
      security: { ...mockStore.settings.security, ...patch.security },
    };
    return mockStore.settings;
  },

  /** GET /settings/sessions */
  async sessions(): Promise<DeviceSession[]> {
    if (!config.useMockApi) return http.get<DeviceSession[]>("/settings/sessions");
    await mockLatency(180, 360);
    return mockSessions;
  },

  /** DELETE /settings/sessions/:id */
  async revokeSession(id: string): Promise<void> {
    if (!config.useMockApi) {
      await http.delete(`/settings/sessions/${id}`);
      return;
    }
    await mockLatency(200, 400);
    void id;
  },

  /** POST /settings/password */
  async changePassword(current: string, next: string): Promise<void> {
    if (!config.useMockApi) {
      await http.post("/settings/password", { current, next });
      return;
    }
    await mockLatency(400, 800);
    void current;
    void next;
  },

  /** POST /settings/services/:id/toggle */
  async toggleService(id: string, connected: boolean): Promise<void> {
    if (!config.useMockApi) {
      await http.post(`/settings/services/${id}/toggle`, { connected });
      return;
    }
    await mockLatency(240, 520);
    mockStore.settings = {
      ...mockStore.settings,
      connectedServices: mockStore.settings.connectedServices.map((service) =>
        service.id === id
          ? {
              ...service,
              connected,
              lastSyncedAt: connected ? new Date().toISOString() : undefined,
            }
          : service,
      ),
    };
  },
};
