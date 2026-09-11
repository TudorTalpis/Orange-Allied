import { config } from "@/lib/config";
import { buildStages } from "@/data/mockProcessing";
import type {
  ProcessingEvent,
  ProcessingJob,
  ProcessingStats,
} from "@/types";
import { ApiError, http } from "./client";
import { mockLatency } from "./mockDelay";
import { mockStore } from "./mockStore";

export const processingApi = {
  /** GET /processing */
  async listJobs(status?: ProcessingJob["status"]): Promise<ProcessingJob[]> {
    if (!config.useMockApi)
      return http.get<ProcessingJob[]>("/processing", { params: { status } });

    await mockLatency();
    return status
      ? mockStore.jobs.filter((job) => job.status === status)
      : mockStore.jobs;
  },

  /** GET /processing/stats */
  async stats(): Promise<ProcessingStats> {
    if (!config.useMockApi) return http.get<ProcessingStats>("/processing/stats");

    await mockLatency(160, 320);
    const active = mockStore.jobs.filter((job) => job.status === "running").length;
    const queued = mockStore.jobs.filter((job) => job.status === "queued").length;
    const failed = mockStore.jobs.filter((job) => job.status === "failed").length;
    const completed = mockStore.jobs.filter(
      (job) => job.status === "completed",
    ).length;
    const durations = mockStore.jobs
      .map((job) => job.durationMs)
      .filter((value): value is number => typeof value === "number");

    const completedToday = 45 + completed;
    const failedToday = failed;

    return {
      activeJobs: active,
      queuedJobs: queued,
      completedToday,
      failedToday,
      averageDurationMs: durations.length
        ? Math.round(durations.reduce((sum, ms) => sum + ms, 0) / durations.length)
        : 0,
      // Kept consistent with the counters above rather than derived from the
      // small in-memory job list, which would contradict them.
      successRate:
        completedToday + failedToday === 0
          ? 1
          : completedToday / (completedToday + failedToday),
    };
  },

  /** GET /processing/events */
  async events(limit = 8): Promise<ProcessingEvent[]> {
    if (!config.useMockApi)
      return http.get<ProcessingEvent[]>("/processing/events", {
        params: { limit },
      });

    await mockLatency(180, 360);
    return [...mockStore.events]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  },

  /** POST /processing/:id/retry */
  async retry(jobId: string): Promise<ProcessingJob> {
    if (!config.useMockApi)
      return http.post<ProcessingJob>(`/processing/${jobId}/retry`);

    await mockLatency(400, 800);
    const index = mockStore.jobs.findIndex((job) => job.id === jobId);
    if (index === -1) throw new ApiError("Sarcina nu a fost găsită.", 404);

    const job = mockStore.jobs[index];
    const retried: ProcessingJob = {
      ...job,
      status: "running",
      progress: 10,
      error: undefined,
      stages: buildStages(1, "active", 20),
      startedAt: new Date().toISOString(),
      finishedAt: undefined,
      attempts: job.attempts + 1,
    };
    mockStore.jobs[index] = retried;

    mockStore.documents = mockStore.documents.map((doc) =>
      doc.id === job.documentId
        ? { ...doc, status: "processing", failureReason: undefined }
        : doc,
    );

    return retried;
  },

  /** POST /processing/:id/cancel */
  async cancel(jobId: string): Promise<ProcessingJob> {
    if (!config.useMockApi)
      return http.post<ProcessingJob>(`/processing/${jobId}/cancel`);

    await mockLatency(240, 480);
    const index = mockStore.jobs.findIndex((job) => job.id === jobId);
    if (index === -1) throw new ApiError("Sarcina nu a fost găsită.", 404);
    const cancelled: ProcessingJob = {
      ...mockStore.jobs[index],
      status: "cancelled",
      finishedAt: new Date().toISOString(),
    };
    mockStore.jobs[index] = cancelled;
    return cancelled;
  },
};
