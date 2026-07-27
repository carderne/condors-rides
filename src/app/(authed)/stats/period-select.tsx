"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryState } from "nuqs";
import { periodLabels, periodParser, type StatsPeriod } from "./period-params";

export function PeriodSelect() {
  const [period, setPeriod] = useQueryState("period", periodParser);

  return (
    <Select value={period} onValueChange={(v) => setPeriod(v as StatsPeriod)}>
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
