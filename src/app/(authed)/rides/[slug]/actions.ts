"use server";

import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function joinRideAction(rideId: string) {
  const user = await getMembership();
  const { id: userId } = user;
  await db.insert(schema.rideMember).values({ rideId, userId });
  revalidatePath("/rides");
}

export async function leaveRideAction(rideId: string) {
  const user = await getMembership();
  const { id: userId } = user;
  await db
    .delete(schema.rideMember)
    .where(and(eq(schema.rideMember.rideId, rideId), eq(schema.rideMember.userId, userId)));
  revalidatePath("/rides");
}
