"use server";

import { getMembership, getSuperUser } from "@/dal/membership";
import { db, schema } from "@/db";
import { invariant } from "@/lib/invariant";
import { and, eq } from "drizzle-orm";
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

export async function togglePromoteRouteAction(routeId: string) {
  await getSuperUser();
  const where = eq(schema.route.id, routeId);
  const route = await db.query.route.findFirst({ where });
  invariant(route);
  const promoted = !route.promoted;
  await db.update(schema.route).set({ promoted }).where(where);
  revalidatePath("/routes");
}

export async function toggleUpvoteRouteAction(routeId: string) {
  const user = await getMembership();
  const { id: userId } = user;

  const where = and(eq(schema.routeVote.userId, userId), eq(schema.routeVote.routeId, routeId));

  await db.transaction(async (tx) => {
    const existingVote = await tx.query.routeVote.findFirst({ where });
    if (existingVote) {
      await tx.delete(schema.routeVote).where(where);
    } else {
      await tx
        .insert(schema.routeVote)
        .values({
          userId,
          routeId,
        })
        .onConflictDoNothing();
    }
  });
  revalidatePath("/rides");
}
