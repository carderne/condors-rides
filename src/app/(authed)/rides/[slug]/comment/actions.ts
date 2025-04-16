"use server";

import { getMembership } from "@/dal/membership";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type State, validator } from "./validate";

export async function action(rideId: string, _: State, formData: FormData): Promise<State> {
  const user = await getMembership();
  const { id: userId } = user;

  const validated = validator(formData);
  if (validated.errors) return validated;
  const { data } = validated;
  const { text } = data;

  await db.insert(schema.comment).values({ userId, rideId, text });
  revalidatePath("/rides");
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

export async function upvoteCommentAction(commentId: string) {
  const user = await getMembership();
  const { id: userId } = user;

  await db
    .insert(schema.commentReaction)
    .values({
      userId,
      commentId,
    })
    .onConflictDoNothing();
  revalidatePath("/rides");
}
