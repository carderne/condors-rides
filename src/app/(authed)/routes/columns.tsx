import { SortableColumn } from "@/components/table/sortable-column";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Route, User } from "@/db/zod";
import { checkIsSuper } from "@/lib/permissions";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { ExternalLinkIcon, MoreHorizontalIcon, ThumbsUpIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { togglePromoteRouteAction, toggleUpvoteRouteAction } from "./actions";

export type RouteHydrated = Omit<Route, "geojson"> & { numVotes: number; numRides: number };

export function getColumns(user: User): ColumnDef<RouteHydrated>[] {
  const columns: ColumnDef<RouteHydrated>[] = [
    {
      id: "actions",
      cell: ({ row }) => <Actions row={row} user={user} />,
      size: 20,
    },
    {
      id: "name",
      accessorFn: (row) => row.name,
      header: ({ column }) => <SortableColumn column={column}>Name</SortableColumn>,
      cell: ({ getValue }) => <div className="max-w-[25ch] truncate">{getValue() as string}</div>,
      size: 180,
    },
    {
      id: "surface",
      accessorFn: (row) => row.surface,
      header: ({ column }) => <SortableColumn column={column}>Surface</SortableColumn>,
      size: 140,
    },
    {
      id: "numRides",
      accessorFn: (row) => row.numRides,
      header: ({ column }) => <SortableColumn column={column}>Rides</SortableColumn>,
      size: 100,
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
  return columns;
}

function Actions({ row, user }: { row: Row<RouteHydrated>; user: User }) {
  const route = row.original;
  const isSuper = checkIsSuper(user);

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={() => toggleUpvoteRouteAction(route.id)}>
        <ThumbsUpIcon />
      </Button>
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
          <DropdownMenuItem asChild>
            <Link href={`/manage/from-route/${route.id}`}>Do it again</Link>
          </DropdownMenuItem>
          {isSuper && (
            <DropdownMenuItem asChild>
              <Link href={`/routes/${route.id}`}>Edit</Link>
            </DropdownMenuItem>
          )}
          {isSuper && (
            <DropdownMenuItem
              onClick={async () => {
                await togglePromoteRouteAction(route.id);
                toast("Route hidden", {
                  action: {
                    label: "Undo",
                    onClick: () => togglePromoteRouteAction(route.id),
                  },
                });
              }}
            >
              {route.promoted ? "Un-promote" : "Promote"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
