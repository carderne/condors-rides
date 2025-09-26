"use server";

import { emitEvent } from "@/clients/posthog";
import { webpush } from "@/clients/webpush";
import { getMembership } from "@/dal/membership";
import { db } from "@/db";
import * as schema from "@/db/schema";
import type { User } from "@/db/zod";
import { invariant } from "@/lib/invariant";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type State, validator } from "./validate";

export async function action(rideId: string, _: State, formData: FormData): Promise<State> {
  const user = await getMembership();
  const { id: userId } = user;
  const ride = await db.query.ride.findFirst({
    where: eq(schema.ride.id, rideId),
    with: { members: { with: { user: true } } },
  });
  invariant(ride, "ride not found");

  const validated = validator(formData);
  if (validated.errors) return validated;
  const { data } = validated;
  const { text } = data;

  await db.insert(schema.comment).values({ userId, rideId, text });
  revalidatePath("/rides");

  // notifications
  const activeWebPushSubs = ride.members
    .map((m) => m.user)
    .filter((u): u is User & { webpushSub: PushSubscription } => u.webpushSub !== null)
    .filter((u) => u.id !== userId);
  const event = "notification";
  const properties = { rideSlug: ride.slug, type: "comment" };

  const notifications = await Promise.allSettled(
    activeWebPushSubs.map(async (user) => {
      emitEvent({ user, event, properties });
      await webpush.sendNotification(
        user.webpushSub,
        JSON.stringify({
          title: ride.name,
          body: `${user.name.slice(0, 8)}: ${text.slice(0, 20)}`,
        }),
      );
    }),
  );
  notifications.forEach((r, i) => {
    if (r.status === "rejected") {
      console.warn("Push failed for:", activeWebPushSubs[i], r.reason);
    }
  });

  return { errors: {} };
}

export async function deleteCommentAction(commentId: string) {
  const user = await getMembership();
  const { id: userId } = user;
  const where =
    user.type === "admin"
      ? eq(schema.comment.id, commentId)
      : and(eq(schema.comment.id, commentId), eq(schema.comment.userId, userId));
  await db.update(schema.comment).set({ deletedAt: new Date() }).where(where);
  revalidatePath("/rides");
}

export async function toggleUpvoteCommentAction(commentId: string) {
  const user = await getMembership();
  const { id: userId } = user;

  const where = and(
    eq(schema.commentReaction.userId, userId),
    eq(schema.commentReaction.commentId, commentId),
  );

  await db.transaction(async (tx) => {
    const existingComment = await tx.query.commentReaction.findFirst({ where });
    if (existingComment) {
      await tx.delete(schema.commentReaction).where(where);
    } else {
      await tx
        .insert(schema.commentReaction)
        .values({
          userId,
          commentId,
        })
        .onConflictDoNothing();
    }
  });
  revalidatePath("/rides");
}
