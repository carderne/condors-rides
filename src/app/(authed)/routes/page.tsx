import { emitPageView } from "@/clients/posthog";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { getConfig } from "@/lib/config";
import { count, eq, isNull, sql } from "drizzle-orm";
import { RoutesTable } from "./table";

const { osKey } = getConfig();

export default async function RoutesPage() {
  const user = await getMembership();
  emitPageView({ user, page: "routes" });
  const routes = await db
    .select({
      id: schema.route.id,
      url: schema.route.url,
      name: schema.route.name,
      distance: schema.route.distance,
      elevation: schema.route.elevation,
      surface: schema.route.surface,
      cafeStop: schema.route.cafeStop,
      notes: schema.route.notes,
      hiddenAt: schema.route.hiddenAt,
      createdAt: schema.route.createdAt,
      updatedAt: schema.route.updatedAt,
      numRides: count(schema.ride.id).as("num_rides"),
      rank: sql<number>`CAST(AVG(${schema.routeRank.rank}) AS INTEGER)`.as("rank"),
    })
    .from(schema.route)
    .leftJoin(schema.ride, eq(schema.ride.routeUrl, schema.route.url))
    .leftJoin(schema.routeRank, eq(schema.routeRank.routeId, schema.route.id))
    .where(isNull(schema.route.hiddenAt))
    .groupBy(schema.route.id);

  return <RoutesTable user={user} routes={routes} osKey={osKey} />;
}
