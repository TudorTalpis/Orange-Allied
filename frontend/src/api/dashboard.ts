import { config } from "@/lib/config";
import { mockDashboard } from "@/data/mockDashboard";
import type { DashboardOverview, DistributionSlice, Document } from "@/types";
import { http } from "./client";
import { mockLatency } from "./mockDelay";
import { mockStore } from "./mockStore";

/**
 * The overview is derived from the same store every other screen reads, so a
 * freshly uploaded document is reflected here immediately — the counts, the
 * category composition and the status split all move together.
 *
 * The 30-day series stays a fixture: it is history, and the prototype has none.
 */
function statusSlices(documents: Document[]): DistributionSlice[] {
  const count = (predicate: (doc: Document) => boolean) =>
    documents.filter(predicate).length;

  return [
    { label: "Procesate", value: count((d) => d.status === "processed"), color: "#199E70" },
    {
      label: "În procesare",
      value: count((d) => d.status === "processing" || d.status === "queued"),
      color: "#C98500",
    },
    { label: "Necesită verificare", value: count((d) => d.status === "needs_review"), color: "#3987E5" },
    { label: "Eșuate", value: count((d) => d.status === "failed"), color: "#D6494B" },
  ];
}

function categorySlices(documents: Document[]): DistributionSlice[] {
  const palette = ["#C3163A", "#C98500", "#3987E5", "#199E70", "#9085E9", "#D55181"];
  const byCategory = new Map<string, number>();

  for (const doc of documents) {
    const category = mockStore.categories.find((item) => item.id === doc.categoryId);
    const label = category?.name ?? "Neclasificate";
    byCategory.set(label, (byCategory.get(label) ?? 0) + 1);
  }

  const sorted = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  // Six categorical slots; everything past the fifth folds into "Altele".
  const top = sorted.slice(0, 5);
  const rest = sorted.slice(5).reduce((sum, [, value]) => sum + value, 0);

  const slices = top.map(([label, value], index) => ({
    label,
    value,
    color: palette[index],
  }));
  if (rest > 0) slices.push({ label: "Altele", value: rest, color: palette[5] });
  return slices;
}

export const dashboardApi = {
  /** GET /dashboard/overview */
  async overview(): Promise<DashboardOverview> {
    if (!config.useMockApi) {
      return http.get<DashboardOverview>("/dashboard/overview");
    }
    await mockLatency(280, 560);

    const documents = mockStore.documents;
    const processed = documents.filter((doc) => doc.status === "processed").length;
    const processing = documents.filter(
      (doc) => doc.status === "processing" || doc.status === "queued",
    ).length;
    // The fixtures describe a workspace larger than the records we ship, so the
    // seeded baseline is kept and the user's own uploads add to it.
    const baselineGb = 4.8;
    const uploadedGb = documents
      .filter((doc) => doc.source === "upload")
      .reduce((sum, doc) => sum + doc.size, 0) / 1024 ** 3;
    const storageGb = baselineGb + uploadedGb;

    const categories = new Set(
      documents.map((doc) => doc.categoryId).filter(Boolean),
    ).size;

    const baseline = mockDashboard.stats;
    const seededTotal = 1248 - documents.filter((doc) => doc.source === "seed").length;

    const stats = baseline.map((stat) => {
      switch (stat.id) {
        case "total":
          return {
            ...stat,
            rawValue: seededTotal + documents.length,
            value: (seededTotal + documents.length).toLocaleString("ro-RO"),
          };
        case "processed":
          return {
            ...stat,
            rawValue: seededTotal + processed,
            value: (seededTotal + processed).toLocaleString("ro-RO"),
          };
        case "processing":
          return { ...stat, rawValue: processing, value: String(processing) };
        case "categories":
          return { ...stat, rawValue: categories, value: String(categories) };
        case "storage":
          return {
            ...stat,
            rawValue: storageGb,
            value: `${storageGb.toFixed(1).replace(".", ",")} GB`,
          };
        default:
          return stat;
      }
    });

    return {
      stats,
      processedOverTime: mockDashboard.processedOverTime,
      byDocumentType: mockDashboard.byDocumentType,
      byStatus: statusSlices(documents),
      byCategory: categorySlices(documents),
    };
  },
};
