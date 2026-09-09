export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  icon: string;
  /** Percentage change against the previous period. */
  delta?: number;
  deltaLabel?: string;
  intent?: "default" | "primary" | "success" | "warning";
  hint?: string;
}

export interface TimeSeriesPoint {
  date: string;
  processed: number;
  uploaded: number;
  failed: number;
}

export interface DistributionSlice {
  label: string;
  value: number;
  color: string;
}

export interface DashboardOverview {
  stats: DashboardStat[];
  processedOverTime: TimeSeriesPoint[];
  byDocumentType: DistributionSlice[];
  byStatus: DistributionSlice[];
  byCategory: DistributionSlice[];
}
