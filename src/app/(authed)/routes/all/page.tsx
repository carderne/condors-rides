import { emitPageView } from "@/clients/posthog";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { getConfig } from "@/lib/config";
import { and, count, countDistinct, eq, exists, type SQL } from "drizzle-orm";
import { RoutesTable } from "../table";

const { osKey } = getConfig();

export default async function RoutesPage() {
  const user = await getMembership();
  emitPageView({ user, page: "routes_all" });
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
      numRides: count(schema.ride.id),
      numVotes: countDistinct(schema.routeVote.userId),
      userVoted: exists(
        db
          .select()
          .from(schema.routeVote)
          .where(
            and(
              eq(schema.routeVote.routeId, schema.route.id),
              eq(schema.routeVote.userId, user.id),
            ),
          ),
      ) as SQL<boolean>,
    })
    .from(schema.route)
    .leftJoin(schema.ride, eq(schema.ride.routeUrl, schema.route.url))
    .leftJoin(schema.routeVote, eq(schema.routeVote.routeId, schema.route.id))
    .groupBy(schema.route.id)
    .orderBy(schema.route.name);

  return <RoutesTable user={user} routes={routes} osKey={osKey} />;
}
