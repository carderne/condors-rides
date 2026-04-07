"use server";

import { getMembership, getSuperUser, maybeGetMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { invariant } from "@/lib/invariant";
import { and, count, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getRemainingRoutes() {
  return db
    .select({
      id: schema.route.id,
      url: schema.route.url,
      name: schema.route.name,
      distance: schema.route.distance,
      elevation: schema.route.elevation,
      surface: schema.route.surface,
      cafeStop: schema.route.cafeStop,
      direction: schema.route.direction,
      notes: schema.route.notes,
      promoted: schema.route.promoted,
      geojson: schema.route.geojson,
      numVotes: sql<number>`0`,
    })
    .from(schema.route)
    .where(eq(schema.route.promoted, false))
    .orderBy(schema.route.name);
}

export async function getRouteVoteStatus(routeId: string) {
  const user = await maybeGetMembership();

  const [[voteCount], vote] = await Promise.all([
    db
      .select({ count: count() })
      .from(schema.routeVote)
      .where(eq(schema.routeVote.routeId, routeId)),
    user
      ? db.query.routeVote.findFirst({
          columns: { userId: true },
          where: and(eq(schema.routeVote.routeId, routeId), eq(schema.routeVote.userId, user.id)),
        })
      : undefined,
  ]);
  invariant(voteCount);

  const numVotes = voteCount.count;
  const userVoted = vote !== undefined;

  return { numVotes, userVoted };
}

export async function togglePromoteRouteAction(routeId: string) {
  await getSuperUser();
  const where = eq(schema.route.id, routeId);
  const route = await db.query.route.findFirst({ where });
  invariant(route);
  const promoted = !route.promoted;
  await db.update(schema.route).set({ promoted }).where(where);
  revalidatePath("/map");
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
  revalidatePath("/map");
}
