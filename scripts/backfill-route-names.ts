import { db, schema } from "@/db";
import { getRouteInfo } from "@/lib/geojson";
import { eq } from "drizzle-orm";

async function backfillRouteNames() {
  const routes = await db.query.route.findMany({
    with: { rides: { columns: { name: true } } },
  });

  for (const route of routes) {
    const rideNames = route.rides.map((r) => r.name);

    // Skip if route name doesn't match any ride name (already has a real name)
    if (!rideNames.includes(route.name)) {
      console.log(`SKIP ${route.url} — name "${route.name}" doesn't match any ride name`);
      continue;
    }

    const info = await getRouteInfo(route.url);
    if (!info) {
      console.log(`FAIL ${route.url} — API call failed`);
      continue;
    }

    await db
      .update(schema.route)
      .set({ url: info.url, name: info.name, geojson: info.geojson })
      .where(eq(schema.route.id, route.id));

    console.log(
      `OK ${route.url} — "${route.name}" → "${info.name}"${info.url !== route.url ? ` (url: ${info.url})` : ""}`,
    );
  }

  console.log("Done!");
  process.exit(0);
}

backfillRouteNames();
