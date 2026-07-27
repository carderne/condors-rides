import { createLoader, parseAsStringLiteral } from "nuqs/server";

export type StatsPeriod = "all" | "12m" | "agm";

export const periodLabels: Record<StatsPeriod, string> = {
  all: "All time",
  "12m": "Last 12 months",
  agm: "Since last AGM",
};

const periods = Object.keys(periodLabels) as StatsPeriod[];

// Default period is "Last 12 months". `shallow: false` so changing it
// re-runs the server component (and its DB queries).
export const periodParser = parseAsStringLiteral(periods)
  .withDefault("12m")
  .withOptions({ shallow: false });

export const loadStatsParams = createLoader({ period: periodParser });
