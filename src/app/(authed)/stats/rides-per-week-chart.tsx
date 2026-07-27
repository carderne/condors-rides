"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface WeeklyData {
  week: string;
  weekLabel: string;
  surface: "road" | "offroad" | "virtual";
  rides: number;
  riders: number;
  uniqueRiders: number;
  riderKms: number;
}

interface RidesPerWeekChartProps {
  data: WeeklyData[];
}

const metrics = {
  rides: { label: "Rides per week", key: "rides" as const },
  riders: { label: "Riders per week", key: "riders" as const },
  uniqueRiders: { label: "Unique riders per week", key: "uniqueRiders" as const },
  riderKms: { label: "Rider-kms per week", key: "riderKms" as const },
};

type MetricKey = keyof typeof metrics;

const chartConfig = {
  road: {
    label: "Road",
    color: "hsl(327 73% 57%)", // primary color
  },
  offroad: {
    label: "Off-Road",
    color: "oklch(47.3% 0.137 46.201)", // amber-800
  },
  virtual: {
    label: "Virtual",
    color: "oklch(43.8% 0.218 303.724)", // purple-800
  },
} satisfies ChartConfig;

export function RidesPerWeekChart({ data }: RidesPerWeekChartProps) {
  const [metric, setMetric] = useState<MetricKey>("rides");
  const metricKey = metrics[metric].key;

  // Transform data from long format to wide format for stacked bar chart
  const chartData = useMemo(() => {
    const weekMap = new Map<
      string,
      { week: string; weekLabel: string; road: number; offroad: number; virtual: number }
    >();

    data.forEach((item) => {
      if (!weekMap.has(item.week)) {
        weekMap.set(item.week, {
          week: item.week,
          weekLabel: item.weekLabel,
          road: 0,
          offroad: 0,
          virtual: 0,
        });
      }
      const weekData = weekMap.get(item.week)!;
      weekData[item.surface] = item[metricKey];
    });

    return Array.from(weekMap.values());
  }, [data, metricKey]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(metrics) as MetricKey[]).map((key) => (
              <SelectItem key={key} value={key}>
                {metrics[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="weekLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="road" fill="var(--color-road)" stackId="rides" radius={[0, 0, 0, 0]} />
          <Bar
            dataKey="offroad"
            fill="var(--color-offroad)"
            stackId="rides"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="virtual"
            fill="var(--color-virtual)"
            stackId="rides"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
