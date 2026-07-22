import { db, schema } from "@/db";
import { geocode } from "@/lib/geojson";
import { eq, isNotNull } from "drizzle-orm";

async function geocodeCafeStops() {
  const rides = await db.query.ride.findMany({
    columns: { id: true, slug: true, cafeStop: true, cafeStopLoc: true },
    with: { route: { columns: { geojson: true } } },
    where: isNotNull(schema.ride.cafeStop),
  });

  console.log(`Found ${rides.length} rides with a cafe stop`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const ride of rides) {
    const cafeStop = ride.cafeStop;
    if (!cafeStop) {
      continue;
    }

    if (ride.cafeStopLoc) {
      console.log(`SKIP ${ride.slug} — already has a location`);
      skipped++;
      continue;
    }

    let loc;
    try {
      loc = await geocode(cafeStop, { route: ride.route?.geojson ?? null });
    } catch (error) {
      console.log(`FAIL ${ride.slug} — geocode error for "${cafeStop}":`, error);
      failed++;
      continue;
    }

    if (!loc) {
      console.log(`FAIL ${ride.slug} — no result for "${cafeStop}"`);
      failed++;
      continue;
    }

    await db.update(schema.ride).set({ cafeStopLoc: loc }).where(eq(schema.ride.id, ride.id));

    console.log(`OK   ${ride.slug} — "${cafeStop}" → [${loc[0]}, ${loc[1]}]`);
    ok++;
  }

  console.log(`Done! ${ok} geocoded, ${skipped} skipped, ${failed} failed.`);
  process.exit(0);
}

geocodeCafeStops();
