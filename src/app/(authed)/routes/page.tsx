import { emitPageView } from "@/clients/posthog";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { and, count, isNull, sql } from "drizzle-orm";
import { RoutesTable } from "./table";

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

  return <RoutesTable routes={routesParsed} />;
}
