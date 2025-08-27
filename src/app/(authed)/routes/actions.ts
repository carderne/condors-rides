"use server";

import { getMembership, getSuperUser } from "@/dal/membership";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export async function getGeojsonAction(routeId: string) {
  const route = await db.query.route.findFirst({
    columns: { geojson: true },
    where: eq(schema.route.id, routeId),
  });

  if (!route) {
    return notFound();
  }

  return route.geojson;
}

export async function hideRouteAction(routeId: string) {
  await getSuperUser();
  await db.update(schema.route).set({ hiddenAt: new Date() }).where(eq(schema.route.id, routeId));
  revalidatePath("/routes");
}

export async function unHideRouteAction(routeId: string) {
  await getSuperUser();
  await db.update(schema.route).set({ hiddenAt: null }).where(eq(schema.route.id, routeId));
  revalidatePath("/routes");
}

export async function setRouteRankAction(routeId: string, rank: number) {
  const user = await getMembership();
  await db
    .insert(schema.routeRank)
    .values({
      routeId,
      userId: user.id,
      rank,
    })
    .onConflictDoUpdate({
      target: [schema.routeRank.routeId, schema.routeRank.userId],
      set: { rank },
    });
  revalidatePath("/routes");
}
