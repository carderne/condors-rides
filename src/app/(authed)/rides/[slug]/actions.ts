"use server";

import { getAdmin, getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { checkIsAdmin } from "@/lib/permissions";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function unclaimRideAction(rideId: string) {
  const user = await getMembership();
  const where = checkIsAdmin(user)
    ? eq(schema.ride.id, rideId)
    : and(eq(schema.ride.id, rideId), eq(schema.ride.userId, user.id));
  await db.update(schema.ride).set({ unclaimed: true }).where(where);
  revalidatePath("/rides");
}

export async function claimRideAction(rideId: string) {
  const user = await getMembership();
  await db
    .update(schema.ride)
    .set({ unclaimed: false, userId: user.id })
    .where(and(eq(schema.ride.id, rideId), eq(schema.ride.unclaimed, true)));
  await db
    .delete(schema.rideMember)
    .where(and(eq(schema.rideMember.rideId, rideId), eq(schema.rideMember.userId, user.id)));
  revalidatePath("/rides");
}

export async function cancelRideAction(rideId: string) {
  const user = await getMembership();
  const where = checkIsAdmin(user)
    ? eq(schema.ride.id, rideId)
    : and(eq(schema.ride.id, rideId), eq(schema.ride.userId, user.id));
  await db.update(schema.ride).set({ canceledAt: new Date() }).where(where);
  revalidatePath("/rides");
}

export async function deleteRideAction(rideId: string) {
  await getAdmin();
  await db.update(schema.ride).set({ deletedAt: new Date() }).where(eq(schema.ride.id, rideId));
  redirect("/rides");
}
