"use client";

import { DataTable } from "@/components/table/data-table";
import { columns, type UserHydrated } from "./columns";

export function AdminTable({ users }: { users: UserHydrated[] }) {
  return <DataTable filterCol="name" data={users} columns={columns} />;
}
