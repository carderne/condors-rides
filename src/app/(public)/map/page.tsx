import { emitPageView } from "@/clients/posthog";
import { maybeGetMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { getConfig } from "@/lib/config";
import { dedupeCafeStops } from "@/lib/geojson";
import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { RouteMap } from "./map";

const { osKey } = getConfig();

export default async function MapPage() {
  const user = await maybeGetMembership();
  if (user) {
    emitPageView({ user, page: "map" });
  }

  const routes = await db
    .select({
      id: schema.route.id,
      url: schema.route.url,
      name: schema.route.name,
      distance: schema.route.distance,
      elevation: schema.route.elevation,
      surface: schema.route.surface,
      cafeStop: schema.route.cafeStop,
      direction: schema.route.direction,
      notes: schema.route.notes,
      promoted: schema.route.promoted,
      geojson: schema.route.geojson,
      numVotes: sql<number>`0`,
    })
    .from(schema.route)
    .where(eq(schema.route.promoted, true));

  // All geocoded cafe stops (deduped to one pin per ~1km cluster).
  const cafeStopRows = await db
    .select({
      name: schema.ride.cafeStop,
      loc: schema.ride.cafeStopLoc,
    })
    .from(schema.ride)
    .where(and(isNotNull(schema.ride.cafeStopLoc), isNull(schema.ride.deletedAt)));

  const cafeStops = dedupeCafeStops(cafeStopRows);

  return <RouteMap osKey={osKey} initialRoutes={routes} cafeStops={cafeStops} user={user} />;
}
