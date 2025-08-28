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
  const notSorted = sorted === false;

  const isSortedAsc = sorted === "asc";
  const sortDescending = notSorted ? true : isSortedAsc;

  return (
    <Button
      className="group mr-8 !px-0 text-left"
      variant="ghost"
      onClick={() => column.toggleSorting(sortDescending)}
    >
      {children}
      {notSorted ? (
        <ChevronsUpDownIcon className="group-hover:text-brand-foreground ml-2 size-4" />
      ) : isSortedAsc ? (
        <ChevronUpIcon className="text-primary ml-2 size-4" />
      ) : (
        <ChevronDownIcon className="text-primary ml-2 size-4" />
      )}
    </Button>
  );
}
