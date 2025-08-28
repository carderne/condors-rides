import { emitPageView } from "@/clients/posthog";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { getConfig } from "@/lib/config";
import { count, eq } from "drizzle-orm";
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
      promoted: schema.route.promoted,
      createdAt: schema.route.createdAt,
      updatedAt: schema.route.updatedAt,
      numRides: count(schema.ride.id).as("num_rides"),
      numVotes: count(schema.routeVote.userId).as("num_votes"),
    })
    .from(schema.route)
    .leftJoin(schema.ride, eq(schema.ride.routeUrl, schema.route.url))
    .leftJoin(schema.routeVote, eq(schema.routeVote.routeId, schema.route.id))
    .groupBy(schema.route.id);

  return <RoutesTable user={user} routes={routes} osKey={osKey} />;
}
