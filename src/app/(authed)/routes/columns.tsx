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
import { ExternalLinkIcon, MoreHorizontalIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { hideRouteAction, setRouteRankAction, unHideRouteAction } from "./actions";

export type RouteHydrated = Omit<Route, "geojson"> & { rank: number; numRides: number };

export function getColumns(user: User): ColumnDef<RouteHydrated>[] {
  const columns: ColumnDef<RouteHydrated>[] = [
    {
      id: "actions",
      cell: ({ row }) => <Actions row={row} user={user} />,
      size: 20,
    },
    {
      id: "rank",
      accessorFn: (row) => row.rank,
      header: ({ column }) => <SortableColumn column={column}>Rank</SortableColumn>,
      cell: ({ row }) => <Ranker routeId={row.original.id} rank={row.original.rank} />,
      size: 100,
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
      accessorFn: (row) => row.numRides,
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
  return columns;
}

function Actions({ row, user }: { row: Row<RouteHydrated>; user: User }) {
  const route = row.original;
  const isSuper = checkIsSuper(user);

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
                await hideRouteAction(route.id);
                toast("Route hidden", {
                  action: {
                    label: "Undo",
                    onClick: () => unHideRouteAction(route.id),
                  },
                });
              }}
            >
              Hide
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Ranker({ routeId, rank }: { routeId: string; rank: number | null }) {
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const rankDisplay = rank
    ? Array.from({ length: rank }, (_, index) => (
        <StarIcon className="size-3 fill-current text-amber-400" key={index} />
      ))
    : null;
  const rankDisplaySet = Array.from({ length: 5 }, (_, index) => (
    <StarIcon
      className="size-3 cursor-pointer hover:text-black"
      key={index}
      fill={hoveredIndex !== null && index <= hoveredIndex ? "currentColor" : "none"}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(-1)}
      onClick={() => setRouteRankAction(routeId, index + 1)}
    />
  ));

  return (
    <div className="group h-full min-h-3 w-15">
      <div className="flex group-hover:hidden">{rankDisplay}</div>
      <div className="z-20 hidden group-hover:flex">{rankDisplaySet}</div>
    </div>
  );
}
