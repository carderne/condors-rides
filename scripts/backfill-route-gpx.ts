import { db, schema } from "@/db";
import { lineStringToGpx } from "@/lib/gpx";
import { and, eq, isNotNull, isNull } from "drizzle-orm";

// Backfill GPX for existing routes. Idempotent: only picks routes that have a
// geojson but no gpx yet. We generate the GPX from the stored geojson rather
// than re-fetching from the providers (no API calls needed).
async function backfillRouteGpx() {
  const routes = await db.query.route.findMany({
    columns: { id: true, url: true, name: true, geojson: true },
    where: and(isNull(schema.route.gpx), isNotNull(schema.route.geojson)),
  });

  console.log(`Found ${routes.length} route(s) needing GPX`);

  for (const route of routes) {
    if (!route.geojson) {
      // shouldn't happen given the where clause, but keep TS + safety happy
      console.log(`SKIP ${route.url} — no geojson`);
      continue;
    }

    const gpx = lineStringToGpx(route.geojson, route.name);

    await db.update(schema.route).set({ gpx }).where(eq(schema.route.id, route.id));

    console.log(`OK ${route.url} — "${route.name}"`);
  }

  console.log("Done!");
  process.exit(0);
}

backfillRouteGpx();
