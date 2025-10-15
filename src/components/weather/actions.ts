"use server";

import { getForecaseForTime as getForecastForTime } from "@/clients/weather";
import { db, schema } from "@/db";
import { getAverageCoords } from "@/lib/geojson";
import { invariant } from "@/lib/invariant";
import { eq } from "drizzle-orm";

export async function getWeatherAction(rideId: string) {
  const ride = await db.query.ride.findFirst({
    where: eq(schema.ride.id, rideId),
    columns: { date: true, time: true },
    with: { route: { columns: { geojson: true } } },
  });
  invariant(ride);

  const { date, time, route } = ride;
  if (!route || !route.geojson) {
    return { success: false };
  }

  const datetime = combineDateAndTime(date, time);

  const { lat, lon } = getAverageCoords(route.geojson);
  const weather = await getForecastForTime({ lat, lon, datetime });
  return { success: true, weather };
}

function combineDateAndTime(date: Date, time: string): Date {
  console.log({ time });
  const [hours, minutes, seconds] = time.split(":").map(Number);
  if (hours === undefined || minutes === undefined || seconds === undefined) {
    throw new Error("ride time malformed");
  }
  const combined = new Date(date);
  combined.setUTCHours(hours, minutes, seconds, 0);
  return combined;
}
