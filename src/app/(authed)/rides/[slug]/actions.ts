"use server";

import { sendNotifications } from "@/clients/webpush";
import { getAdminUser, getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { invariant } from "@/lib/invariant";
import { checkIsAdmin } from "@/lib/permissions";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function joinRideAction(rideId: string) {
  const user = await getMembership();
  const { id: userId } = user;

  const ride = await db.query.ride.findFirst({
    columns: { name: true, slug: true },
    where: eq(schema.ride.id, rideId),
    with: { leader: { columns: {}, with: { subs: true } } },
  });
  invariant(ride, "no ride found");

  await db.insert(schema.rideMember).values({ rideId, userId });

  await sendNotifications({
    targets: ride.leader.subs,
    title: "New rider joined!",
    body: ride.name,
    slug: ride.slug,
    properties: { type: "join", joinerUserId: userId },
  });
  revalidatePath("/rides");
}

export async function leaveRideAction(rideId: string) {
  const user = await getMembership();
  const { id: userId } = user;

  const ride = await db.query.ride.findFirst({
    columns: { name: true, slug: true },
    where: eq(schema.ride.id, rideId),
    with: { leader: { columns: {}, with: { subs: true } } },
  });
  invariant(ride, "no ride found");

  await db
    .delete(schema.rideMember)
    .where(and(eq(schema.rideMember.rideId, rideId), eq(schema.rideMember.userId, userId)));

  await sendNotifications({
    targets: ride.leader.subs,
    title: "Rider left",
    body: ride.name,
    slug: ride.slug,
    properties: { type: "leave", joinerUserId: userId },
  });

  revalidatePath("/rides");
}

export async function unclaimRideAction(rideId: string) {
  const user = await getMembership();

  const ride = await db.query.ride.findFirst({
    columns: { name: true, slug: true },
    where: eq(schema.ride.id, rideId),
    with: { members: { with: { user: { columns: {}, with: { subs: true } } } } },
  });
  invariant(ride, "no ride found");

  const where = checkIsAdmin(user)
    ? eq(schema.ride.id, rideId)
    : and(eq(schema.ride.id, rideId), eq(schema.ride.userId, user.id));
  await db.update(schema.ride).set({ unclaimed: true }).where(where);

  await sendNotifications({
    targets: ride.members.flatMap((m) => m.user.subs),
    title: "Ride has no leader",
    body: ride.name,
    slug: ride.slug,
    properties: { type: "unclaim" },
  });

  revalidatePath("/rides");
}

export async function claimRideAction(rideId: string) {
  const user = await getMembership();

  const ride = await db.query.ride.findFirst({
    columns: { name: true, slug: true },
    where: eq(schema.ride.id, rideId),
    with: { members: { with: { user: { columns: {}, with: { subs: true } } } } },
  });
  invariant(ride, "no ride found");

  await db
    .update(schema.ride)
    .set({ unclaimed: false, userId: user.id })
    .where(and(eq(schema.ride.id, rideId), eq(schema.ride.unclaimed, true)));
  await db
    .delete(schema.rideMember)
    .where(and(eq(schema.rideMember.rideId, rideId), eq(schema.rideMember.userId, user.id)));

  await sendNotifications({
    targets: ride.members.flatMap((m) => m.user.subs),
    title: "Ride has new leader!",
    body: ride.name,
    slug: ride.slug,
    properties: { type: "claim" },
  });

  revalidatePath("/rides");
}

export async function cancelRideAction(rideId: string) {
  const user = await getMembership();
  const ride = await db.query.ride.findFirst({
    columns: { name: true, slug: true },
    where: eq(schema.ride.id, rideId),
    with: { members: { with: { user: { columns: {}, with: { subs: true } } } } },
  });
  invariant(ride, "no ride found");

  const where = checkIsAdmin(user)
    ? eq(schema.ride.id, rideId)
    : and(eq(schema.ride.id, rideId), eq(schema.ride.userId, user.id));
  await db.update(schema.ride).set({ canceledAt: new Date() }).where(where);

  await sendNotifications({
    targets: ride.members.flatMap((m) => m.user.subs),
    title: "Ride cancelled",
    body: ride.name,
    slug: ride.slug,
    properties: { type: "cancel" },
  });

  revalidatePath("/rides");
}

export async function unCancelRideAction(rideId: string) {
  const user = await getMembership();
  const ride = await db.query.ride.findFirst({
    columns: { name: true, slug: true },
    where: eq(schema.ride.id, rideId),
    with: { members: { with: { user: { columns: {}, with: { subs: true } } } } },
  });
  invariant(ride, "no ride found");

  const where = checkIsAdmin(user)
    ? eq(schema.ride.id, rideId)
    : and(eq(schema.ride.id, rideId), eq(schema.ride.userId, user.id));
  await db.update(schema.ride).set({ canceledAt: null }).where(where);

  await sendNotifications({
    targets: ride.members.flatMap((m) => m.user.subs),
    title: "Ride is back on!",
    body: ride.name,
    slug: ride.slug,
    properties: { type: "uncancel" },
  });

  revalidatePath("/rides");
}

export async function deleteRideAction(rideId: string) {
  await getAdminUser();
  await db.update(schema.ride).set({ deletedAt: new Date() }).where(eq(schema.ride.id, rideId));
  redirect("/rides");
}
