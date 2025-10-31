"use server";

import { sendNotifications } from "@/clients/notify";
import { getMembership } from "@/dal/membership";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { invariant } from "@/lib/invariant";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type State, validator } from "./validate";

export async function action(rideId: string, _: State, formData: FormData): Promise<State> {
  const user = await getMembership();
  const { id: userId } = user;
  const ride = await db.query.ride.findFirst({
    where: eq(schema.ride.id, rideId),
    with: {
      leader: { with: { subs: { where: eq(schema.sub.rideUpdate, true) } } },
      members: { with: { user: { with: { subs: { where: eq(schema.sub.rideUpdate, true) } } } } },
    },
  });
  invariant(ride, "ride not found");

  const validated = validator(formData);
  if (validated.errors) return validated;
  const { data } = validated;
  const { text } = data;

  await db.insert(schema.comment).values({ userId, rideId, text });
  revalidatePath("/rides");

  // notifications
  const activeSubs = [...ride.leader.subs, ...ride.members.flatMap((m) => m.user.subs)];
  const properties = { rideSlug: ride.slug, type: "comment" };

  sendNotifications({
    targets: activeSubs,
    title: ride.name,
    body: `${user.name}: ${text.slice(0, 100)}`,
    slug: ride.slug,
    properties,
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

  const comment = await db.query.comment.findFirst({
    columns: {},
    where: eq(schema.comment.id, commentId),
    with: {
      ride: { columns: { slug: true } },
      user: { columns: {}, with: { subs: true } },
    },
  });
  invariant(comment, "no comment found");

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

  const properties = { rideSlug: comment.ride.slug, type: "upvote" };
  sendNotifications({
    targets: comment.user.subs,
    title: "Comment upvoted",
    body: `by ${user.name}`,
    slug: comment.ride.slug,
    properties,
  });

  revalidatePath("/rides");
}
