import { SortableColumn } from "@/components/table/sortable-column";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { ExternalLinkIcon, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";

export type RouteCustom = {
  route: string;
  numRides: number;
  meanDistance: string;
  meanElevation: string;
  distinctCafeStops: string;
  name: string;
  rideSlug: string;
};

export const columns: ColumnDef<RouteCustom>[] = [
  {
    id: "actions",
    cell: ({ row }) => <Actions row={row} />,
    size: 20,
  },
  {
    id: "name",
    accessorFn: (row) => row.name,
    header: ({ column }) => <SortableColumn column={column}>Name</SortableColumn>,
    size: 200,
  },
  {
    id: "numRides",
    accessorFn: (row) => row.numRides,
    header: ({ column }) => <SortableColumn column={column}>Rides</SortableColumn>,
    size: 200,
  },
  {
    id: "meanDistance",
    accessorFn: (row) => row.meanDistance,
    header: ({ column }) => <SortableColumn column={column}>Distance (km)</SortableColumn>,
    size: 50,
  },
  {
    id: "meanElevation",
    accessorFn: (row) => row.meanElevation,
    header: ({ column }) => <SortableColumn column={column}>Elevation (m)</SortableColumn>,
    size: 50,
  },
  {
    id: "distinctCafeStops",
    accessorFn: (row) => row.distinctCafeStops,
    header: ({ column }) => <SortableColumn column={column}>Cafe stops</SortableColumn>,
    size: 50,
  },
];

function Actions({ row }: { row: Row<RouteCustom> }) {
  const route = row.original;

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" asChild>
        <Link
          href={`/${route.route}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-hover flex items-center"
        >
          <ExternalLinkIcon />
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/manage/from-route/${route.rideSlug}`}>Do it again</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
