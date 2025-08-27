"use client";

import { DataTable } from "@/components/table/data-table";
import type { User } from "@/db/zod";
import { getColumns, type RouteHydrated } from "./columns";
import { RoutesTableMap } from "./map";

export function RoutesTable({
  user,
  routes,
  osKey,
}: {
  user: User;
  routes: RouteHydrated[];
  osKey: string;
}) {
  const columns = getColumns(user);
  return (
    <DataTable
      filterCol="name"
      data={routes}
      columns={columns}
      expandableRows={(route) => <RoutesTableMap route={route} osKey={osKey} />}
    />
  );
}
