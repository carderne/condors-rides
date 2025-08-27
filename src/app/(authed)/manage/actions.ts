"use server";

import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import type { InsertRide, Ride } from "@/db/zod";
import { formatISODate } from "@/lib/fmt";
import { getGeojson } from "@/lib/geojson";
import { invariant } from "@/lib/invariant";
import { createSlug } from "@/lib/slug";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { type State, validator } from "./validate";

export async function action(
  existingRideId: string | undefined,
  _: State,
  formData: FormData,
): Promise<State> {
  const user = await getMembership();
  const existingRide = existingRideId
    ? await db.query.ride.findFirst({
        where: eq(schema.ride.id, existingRideId),
      })
    : undefined;

  if (existingRideId && !existingRide) {
    return notFound();
  }
  if (existingRide && existingRide.userId !== user.id && user.type !== "admin") {
    return notFound();
  }

  const validated = validator(formData);
  if (validated.errors) return validated;
  const { data } = validated;

  const slug = existingRideId ? undefined : await createSlug(data.date, data.name);

  const geojson = await getGeojson(data.routeUrl);
  const insertable = {
    ...data,
    // convert undefined to null
    // so they clear the db column if not set
    notes: data.notes ?? null,
    elevation: data.elevation ?? null,
    routeUrl: data.routeUrl ?? null,
    maxGroupSize: data.maxGroupSize ?? null,
    cafeStop: data.cafeStop ?? null,
    geojson,
  };

  const ride = await db.transaction(async (tx) => {
    const existingRide = existingRideId
      ? await tx.query.ride.findFirst({
          where: eq(schema.ride.id, existingRideId),
        })
      : undefined;
    const [ride] = await tx
      .insert(schema.ride)
      .values({ id: existingRideId, slug, userId: user.id, ...insertable })
      .onConflictDoUpdate({
        target: schema.ride.id,
        set: insertable,
      })
      .returning();
    invariant(ride, "no ride upserted");

    const changeNotes = createChangeNotes(existingRide, data);
    const changes = changeNotes.map((note) => ({
      userId: user.id,
      rideId: ride.id,
      note,
    }));
    await tx.insert(schema.rideChange).values(changes);

    const { routeUrl: url } = data;
    if (!url || !geojson) {
      return ride;
    }
    const existingRoute = await tx.query.route.findFirst({
      where: eq(schema.route.url, url),
    });

    if (existingRoute) {
      return ride;
    }

    await tx.insert(schema.route).values({
      url: url,
      name: data.name,
      distance: data.distance,
      elevation: data.elevation,
      surface: data.surface,
      cafeStop: data.cafeStop,
      notes: data.notes,
      geojson: geojson,
    });

    return ride;
  });

  redirect(`/rides/${ride.slug}`);
}

function createChangeNotes(ride: Ride | undefined, data: Partial<InsertRide>): string[] {
  if (!ride) {
    return ["Created"];
  }

  const keysChanged = (Object.keys(data) as (keyof Ride)[]).filter((key) => {
    const r = ride[key];
    const d = data[key];

    // we're not changing this field as it's empty
    if (d === undefined) {
      return false;
    }
    // they're the same: not changed
    if (r === d) {
      return false;
    }
    // dates compare just the date part
    if (r instanceof Date && d instanceof Date) {
      return formatISODate(r) !== formatISODate(d);
    }
    // if we get here there are real changes, so we keep it!
    return true;
  });

  for (const key of keysChanged) {
    console.log("CHANGE", { e: ride[key], d: data[key] });
  }

  const result = keysChanged.map((k) => `${k} changed`);

  return result;
}
