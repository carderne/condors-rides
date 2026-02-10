"use client";

import { Container } from "@/components/container";
import { TabSwitcher, type TabVal } from "@/components/rides/tabs";
import { DataTable } from "@/components/table/data-table";
import type { User } from "@/db/zod";
import { getColumns, type RouteHydrated } from "./columns";
import { RoutesTableMap } from "./map";

const TABS: TabVal[] = [
  { path: "all", color: "pink" },
  { path: "promoted", color: "pink" },
  { path: "liked", color: "green" },
];

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
    <Container className="pt-0">
      <TabSwitcher prefix="routes" tabs={TABS} />
      <DataTable
        searchCol="name"
        filterCols={["surface", "direction"]}
        data={routes}
        columns={columns}
        expandableRows={(route) => <RoutesTableMap route={route} osKey={osKey} />}
      />
    </Container>
  );
}
