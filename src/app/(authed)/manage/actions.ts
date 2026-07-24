"use server";

import { sendNotifications } from "@/clients/notify";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import type { InsertRide, Ride } from "@/db/zod";
import { camelToSentence, formatISODate } from "@/lib/fmt";
import { geocode, getRouteInfo } from "@/lib/geojson";
import { invariant } from "@/lib/invariant";
import { createSlug } from "@/lib/slug";
import { and, eq } from "drizzle-orm";
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
        with: {
          members: {
            with: {
              user: {
                with: {
                  subs: {
                    where: eq(schema.sub.rideUpdate, true),
                  },
                },
              },
            },
          },
        },
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

  let routeInfo = null;
  try {
    routeInfo = await getRouteInfo(data.routeUrl);
  } catch {
    return {
      formData,
      errors: {},
      notify: {
        type: "error",
        message:
          "Bad route URL, make sure it's a URL and nothing else. Or just remove it and try add it back after.",
      },
    };
  }
  const cafeStop = data.cafeStop ?? null;

  // geocode the cafe stop so we can show it on a map. if there's no cafe stop
  // we null the location too. never block ride creation on this: if it fails,
  // log and proceed with a null location.
  let cafeStopLoc: GeoJSON.Position | null = null;
  if (cafeStop) {
    const unchanged = existingRide?.cafeStop === cafeStop && existingRide.cafeStopLoc;
    if (unchanged) {
      // cafe stop hasn't changed, keep the existing location
      cafeStopLoc = existingRide.cafeStopLoc;
    } else {
      try {
        // pass the route so we can reject cafe stops that aren't near it
        // (e.g. a same-named venue elsewhere).
        cafeStopLoc = await geocode(cafeStop, { route: routeInfo?.geojson ?? null });
      } catch (error) {
        console.error("failed to geocode cafe stop", cafeStop, error);
      }
    }
  }

  const insertable = {
    ...data,
    // convert undefined to null
    // so they clear the db column if not set
    notes: data.notes ?? null,
    elevation: data.elevation ?? null,
    routeUrl: routeInfo?.url ?? data.routeUrl ?? null,
    maxGroupSize: data.maxGroupSize ?? null,
    cafeStop,
    cafeStopLoc,
    geojson: routeInfo?.geojson ?? null,
  };

  const { ride, changes } = await db.transaction(async (tx) => {
    const [ride] = await tx
      .insert(schema.ride)
      .values({ id: existingRideId, slug, userId: user.id, ...insertable })
      .onConflictDoUpdate({
        target: schema.ride.id,
        set: insertable,
      })
      .returning();
    invariant(ride, "no ride upserted");

    const changes = createChangeNotes(existingRide, data);

    if (changes.length > 0) {
      await tx.insert(schema.rideChange).values(
        changes.map((change) => ({
          userId: user.id,
          rideId: ride.id,
          note: change === "createdAt" ? "Created" : `${change} changed`,
        })),
      );
    }

    if (["road", "offroad"].includes(ride.surface) && data.distance !== undefined) {
      if (!data.routeUrl || !routeInfo) {
        return { ride, changes };
      }
      const existingRoute = await tx.query.route.findFirst({
        where: eq(schema.route.url, routeInfo.url),
      });

      if (existingRoute) {
        return { ride, changes };
      }

      await tx.insert(schema.route).values({
        url: routeInfo.url,
        name: routeInfo.name ?? data.name,
        distance: data.distance,
        elevation: data.elevation,
        surface: data.surface,
        cafeStop: data.cafeStop,
        notes: data.notes,
        geojson: routeInfo.geojson,
        gpx: routeInfo.gpx,
      });
    }

    return { ride, changes };
  });

  if (changes.length > 0 && existingRide) {
    // notify people
    const activeSubs = existingRide.members.flatMap((m) => m.user.subs);

    const properties = { rideSlug: ride.slug, type: "change" };
    const changeKey = getMainChange(changes as [RideKey, ...RideKey[]]);
    const message = camelToSentence(changeKey);

    sendNotifications({
      targets: activeSubs,
      title: existingRide.name,
      body: `Changed: ${message}`,
      slug: existingRide.slug,
      properties,
    });
  }

  if (!existingRide) {
    // notify people who want notifications of new rides
    const wantNewRideNotifications = await db.query.sub.findMany({
      columns: { userId: true, deviceId: true, token: true },
      where: and(eq(schema.sub.rideNew, true)),
    });
    const properties = { rideSlug: ride.slug, type: "new" };

    sendNotifications({
      targets: wantNewRideNotifications,
      title: "New ride posted",
      body: ride.name,
      slug: ride.slug,
      properties,
    });
  }

  redirect(`/rides/${ride.slug}`);
}

type RideKey = keyof Ride;

function createChangeNotes(ride: Ride | undefined, data: Partial<InsertRide>): RideKey[] {
  if (!ride) {
    return ["createdAt"];
  }

  const keysChanged = (Object.keys(data) as RideKey[]).filter((key) => {
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

  return keysChanged;
}

function getMainChange(notes: [RideKey, ...RideKey[]]): RideKey {
  const [firstNote, ...rest] = notes;
  if (rest.length === 0) {
    return firstNote;
  }
  if (notes.some((n) => n === "date")) {
    return "date";
  }
  if (notes.some((n) => n === "time")) {
    return "time";
  }
  if (notes.some((n) => n === "startPoint")) {
    return "startPoint";
  }

  return firstNote;
}
