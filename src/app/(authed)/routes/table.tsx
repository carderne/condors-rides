"use client";

import { RoutesTabSwitcher } from "@/components/routes/tabs";
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
    <main className="flex min-h-full flex-col gap-4">
      <RoutesTabSwitcher />
      <DataTable
        filterCol="name"
        data={routes}
        columns={columns}
        expandableRows={(route) => <RoutesTableMap route={route} osKey={osKey} />}
      />
    </main>
  );
}
