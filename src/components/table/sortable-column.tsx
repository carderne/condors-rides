import { Button } from "@/components/ui/button";
import type { Column } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from "lucide-react";

export function SortableColumn<T>({
  column,
  children,
}: {
  column: Column<T>;
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();
  const isSortedAsc = sorted === "asc";
  return (
    <Button
      className="group mr-8 !px-0 text-left"
      variant="ghost"
      onClick={() => column.toggleSorting(isSortedAsc)}
    >
      {children}
      {sorted === false ? (
        <ChevronsUpDownIcon className="group-hover:text-brand-foreground ml-2 size-4" />
      ) : sorted === "asc" ? (
        <ChevronUpIcon className="text-brand-foreground ml-2 size-4" />
      ) : (
        <ChevronDownIcon className="text-brand-foreground ml-2 size-4" />
      )}
    </Button>
  );
}
