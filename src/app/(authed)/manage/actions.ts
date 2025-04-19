"use server";

import { convertRouteToLineString, getRideWithGpsRoute } from "@/clients/ridewithgps";
import { getStravaRoute } from "@/clients/strava";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { invariant } from "@/lib/invariant";
import { createSlug } from "@/lib/slug";
import polyline from "@mapbox/polyline";
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

  const geojson = await getGeojson(data.route);
  const insertable = {
    ...data,
    // convert undefined to null
    // so they clear the db column if not set
    notes: data.notes ?? null,
    elevation: data.elevation ?? null,
    route: data.route ?? null,
    maxGroupSize: data.maxGroupSize ?? null,
    cafeStop: data.cafeStop ?? null,
    geojson,
  };

  const [ride] = await db
    .insert(schema.ride)
    .values({ id: existingRideId, slug, userId: user.id, ...insertable })
    .onConflictDoUpdate({
      target: schema.ride.id,
      set: insertable,
    })
    .returning();
  invariant(ride, "no ride upserted");

  redirect(`/rides/${ride.slug}`);
}

async function getGeojson(route: string | undefined): Promise<GeoJSON.LineString | null> {
  if (!route) {
    return null;
  }
  if (route.includes("strava.com")) {
    const routeId = route.split("/").at(-1);
    invariant(routeId);
    const stravaResponse = await getStravaRoute(routeId);
    if (!stravaResponse.success) {
      return null;
    }
    const geojson = polyline.toGeoJSON(stravaResponse.data.map.polyline);
    return geojson;
  }
  if (route.includes("ridewithgps.com")) {
    const routeId = route.split("/").at(-1);
    invariant(routeId);
    const response = await getRideWithGpsRoute(routeId);
    if (!response.success) {
      return null;
    }
    const geojson = convertRouteToLineString(response.data);
    return geojson;
  }
  return null;
}
