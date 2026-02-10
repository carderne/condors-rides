import { emitPageView } from "@/clients/posthog";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { getConfig } from "@/lib/config";
import { eq, sql } from "drizzle-orm";
import { RouteMap } from "./map";

const { osKey } = getConfig();

export default async function MapPage() {
  const user = await getMembership();
  emitPageView({ user, page: "map" });

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

  return <RouteMap osKey={osKey} initialRoutes={routes} user={user} />;
}
