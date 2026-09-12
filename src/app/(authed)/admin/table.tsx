"use client";

import { DataTable } from "@/components/table/data-table";
import { getColumns, type UserHydrated } from "./columns";

export function AdminTable({
  users,
  canEditType,
}: {
  users: UserHydrated[];
  canEditType: boolean;
}) {
  return <DataTable searchCol="name" data={users} columns={getColumns(canEditType)} />;
}
