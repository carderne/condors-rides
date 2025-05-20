import { emitPageView } from "@/clients/posthog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { and, count, isNull, sql } from "drizzle-orm";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

export default async function RoutesPage() {
  const user = await getMembership();
  emitPageView({ user, page: "routes" });
  const routes = await db
    .select({
      route: sql<string>`${schema.ride.route}`,
      numRides: count(),
      meanDistance: sql<string>`AVG(${schema.ride.distance})`,
      meanElevation: sql<string | null>`AVG(${schema.ride.elevation})`,
      distinctCafeStops: sql<string>`string_agg(DISTINCT ${schema.ride.cafeStop}, ', ')`,
      name: sql<string>`MIN(${schema.ride.name})`,
      rideSlug: sql<string>`MIN(${schema.ride.slug})`,
    })
    .from(schema.ride)
    .where(and(isNull(schema.ride.deletedAt), sql`${schema.ride.route} IS NOT NULL`))
    .groupBy(schema.ride.route);

  const routesParsed = routes.map((r) => ({
    ...r,
    meanDistance: Number(r.meanDistance).toFixed(0),
    meanElevation: r.meanElevation ? Number(r.meanElevation).toFixed(0) : "",
  }));

  return (
    <div className="w-full rounded-md border">
      <div className="w-full caption-bottom text-sm">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow className="border-b transition-colors">
              <TableHead className="h-12 px-4 text-left align-middle font-medium">Name</TableHead>
              <TableHead className="h-12 px-4 text-right align-middle font-medium">Rides</TableHead>
              <TableHead className="h-12 px-4 text-right align-middle font-medium">
                Distance (km)
              </TableHead>
              <TableHead className="h-12 px-4 text-right align-middle font-medium">
                Elevation (m)
              </TableHead>
              <TableHead className="h-12 px-4 text-left align-middle font-medium">
                Cafe Stops
              </TableHead>
              <TableHead className="h-12 px-4 text-left align-middle font-medium">Route</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routesParsed.map((route) => (
              <TableRow key={route.route} className="hover:bg-muted/50 border-b transition-colors">
                <TableCell className="p-4 align-middle font-medium">{route.name}</TableCell>
                <TableCell className="p-4 text-right align-middle">{route.numRides}</TableCell>
                <TableCell className="p-4 text-right align-middle">{route.meanDistance}</TableCell>
                <TableCell className="p-4 text-right align-middle">
                  {route.meanElevation ?? "N/A"}
                </TableCell>
                <TableCell className="p-4 align-middle">{route.distinctCafeStops}</TableCell>
                <TableCell className="p-4 align-middle">
                  <Link
                    href={route.route}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover flex items-center"
                  >
                    Route Link
                    <ExternalLinkIcon className="ml-1 h-4 w-4" />
                  </Link>
                </TableCell>
                <TableCell className="p-4 align-middle">
                  <Link href={`/manage/from-route/${route.rideSlug}`}>
                    <Button>Do it again</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
