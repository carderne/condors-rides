import { SortableColumn } from "@/components/table/sortable-column";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Route } from "@/db/zod";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { ExternalLinkIcon, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";

export type RouteHydrated = Route & { rides: unknown[] };

export const columns: ColumnDef<RouteHydrated>[] = [
  {
    id: "actions",
    cell: ({ row }) => <Actions row={row} />,
    size: 20,
  },
  {
    id: "name",
    accessorFn: (row) => row.name,
    header: ({ column }) => <SortableColumn column={column}>Name</SortableColumn>,
    cell: ({ getValue }) => <div className="max-w-[30ch] truncate">{getValue() as string}</div>,
    size: 200,
  },
  {
    id: "numRides",
    accessorFn: (row) => row.rides.length,
    header: ({ column }) => <SortableColumn column={column}>Rides</SortableColumn>,
    size: 140,
  },
  {
    id: "distance",
    accessorFn: (row) => row.distance,
    header: ({ column }) => <SortableColumn column={column}>Distance (km)</SortableColumn>,
    size: 140,
  },
  {
    id: "elevation",
    accessorFn: (row) => row.elevation,
    header: ({ column }) => <SortableColumn column={column}>Elevation (m)</SortableColumn>,
    size: 140,
  },
  {
    id: "cafeStop",
    accessorFn: (row) => row.cafeStop,
    header: ({ column }) => <SortableColumn column={column}>Cafe stops</SortableColumn>,
    cell: ({ getValue }) => <div className="max-w-[30ch] truncate">{getValue() as string}</div>,
    size: 300,
  },
];

function Actions({ row }: { row: Row<RouteHydrated> }) {
  const route = row.original;

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" asChild>
        <Link
          href={route.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary"
        >
          <ExternalLinkIcon />
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon className="" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild className="relative">
            <Link href={`/manage/from-route/${route.id}`} className="relative z-10">
              Do it again
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
