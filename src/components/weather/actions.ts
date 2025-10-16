"use server";

import { getForecaseForTime as getForecastForTime, type WeatherData } from "@/clients/weather";
import { db, schema } from "@/db";
import { getAverageCoords } from "@/lib/geojson";
import { invariant } from "@/lib/invariant";
import type { Result } from "@/types/result";
import { eq } from "drizzle-orm";

export async function getWeatherAction(rideId: string): Promise<Result<WeatherData, string>> {
  const ride = await db.query.ride.findFirst({
    where: eq(schema.ride.id, rideId),
    columns: { date: true, time: true },
    with: { route: { columns: { geojson: true } } },
  });
  invariant(ride);

  const { date, time, route } = ride;
  if (!route || !route.geojson) {
    return { ok: false, error: "No route" };
  }

  const datetime = combineDateAndTime(date, time);

  const { lon, lat } = getAverageCoords(route.geojson);
  const weather = await getForecastForTime({ lon, lat, datetime });
  return weather;
}

function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  if (hours === undefined || minutes === undefined || seconds === undefined) {
    throw new Error("ride time malformed");
  }
  const combined = new Date(date);
  combined.setUTCHours(hours, minutes, seconds, 0);
  return combined;
}
