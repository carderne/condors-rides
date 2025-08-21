import { SortableColumn } from "@/components/table/sortable-column";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Ride, User } from "@/db/zod";
import { formatFullDateTime } from "@/lib/fmt";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";
import { banUserAction, unbanUserAction } from "./actions";

export type UserHydrated = User & { rides: Array<Ride>; ridesJoined: Array<unknown> };

export const columns: ColumnDef<UserHydrated>[] = [
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
    id: "email",
    accessorFn: (row) => row.email,
    header: ({ column }) => <SortableColumn column={column}>Email</SortableColumn>,
    size: 200,
  },
  {
    id: "type",
    accessorFn: (row) => row.type,
    header: ({ column }) => <SortableColumn column={column}>Type</SortableColumn>,
    size: 50,
  },
  {
    id: "numRidesLed",
    accessorFn: (row) => row.rides.length,
    header: ({ column }) => <SortableColumn column={column}>Rides led</SortableColumn>,
    size: 50,
  },
  {
    id: "numRidesJoined",
    accessorFn: (row) => row.ridesJoined.length,
    header: ({ column }) => <SortableColumn column={column}>Rides joined</SortableColumn>,
    size: 50,
  },
  {
    id: "createdAt",
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => (
      <span className="text-xs">{formatFullDateTime(row.original.createdAt)}</span>
    ),
    header: ({ column }) => <SortableColumn column={column}>Joined</SortableColumn>,
    size: 200,
  },
];

function Actions({ row }: { row: Row<UserHydrated> }) {
  const user = row.original;
  const { id: userId } = user;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {user.type !== "admin" &&
            (user.deactivatedAt ? (
              <AlertDialog>
                <AlertDialogTrigger className="hover:bg-muted flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none">
                  Unban user
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Unban user</AlertDialogTitle>
                    <AlertDialogDescription>
                      This user will be able to log in again
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={unbanUserAction.bind(null, userId)}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger className="hover:bg-muted flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none">
                  Ban user
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Ban user</AlertDialogTitle>
                    <AlertDialogDescription>
                      This user will no longer be able to log in
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={banUserAction.bind(null, userId)}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
