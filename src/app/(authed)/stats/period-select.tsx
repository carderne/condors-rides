"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type StatsPeriod = "all" | "12m" | "agm";

export const periodLabels: Record<StatsPeriod, string> = {
  all: "All time",
  "12m": "Last 12 months",
  agm: "Since last AGM",
};

export function PeriodSelect({ value }: { value: StatsPeriod }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("period");
    } else {
      params.set("period", next);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(periodLabels) as StatsPeriod[]).map((key) => (
          <SelectItem key={key} value={key}>
            {periodLabels[key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
