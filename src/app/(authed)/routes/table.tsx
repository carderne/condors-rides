"use client";

import { Map } from "@/components/map";
import { DataTable } from "@/components/table/data-table";
import { columns, type RouteHydrated } from "./columns";

export function RoutesTable({ routes, osKey }: { routes: RouteHydrated[]; osKey: string }) {
  return (
    <DataTable
      filterCol="name"
      data={routes}
      columns={columns}
      expandableRows={{
        renderExpandedContent: (row) => (
          <div className="h-80 w-full">
            {row.geojson && <Map geojson={row.geojson} osKey={osKey} />}
          </div>
        ),
      }}
    />
  );
}
