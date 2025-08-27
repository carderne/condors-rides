"use client";

import { DataTable } from "@/components/table/data-table";
import { columns, type RouteCustom } from "./columns";

export function RoutesTable({ routes }: { routes: RouteCustom[] }) {
  return <DataTable filterCol="name" data={routes} columns={columns} />;
}
