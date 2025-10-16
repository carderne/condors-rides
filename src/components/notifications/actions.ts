"use server";

import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import type { DeviceType } from "@/db/schema";
import { invariant } from "@/lib/invariant";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSubAction(deviceId: string) {
  const user = await getMembership();

  const sub = await db.query.sub.findFirst({
    where: and(eq(schema.sub.userId, user.id), eq(schema.sub.deviceId, deviceId)),
  });

  return sub;
}

export async function unsubscribeUserAction(deviceId: string) {
  const user = await getMembership();
  await db
    .delete(schema.sub)
    .where(and(eq(schema.sub.userId, user.id), eq(schema.sub.deviceId, deviceId)));
  return { success: true };
}

export async function setRideUpdateNotificationAction(enabled: boolean, deviceId: string) {
  const user = await getMembership();
  await db
    .update(schema.sub)
    .set({ rideUpdate: enabled })
    .where(and(eq(schema.sub.userId, user.id), eq(schema.sub.deviceId, deviceId)));
  revalidatePath("/settings");
  return { success: true };
}

export async function setRideNewNotificationAction(enabled: boolean, deviceId: string) {
  const user = await getMembership();
  await db
    .update(schema.sub)
    .set({ rideNew: enabled })
    .where(and(eq(schema.sub.userId, user.id), eq(schema.sub.deviceId, deviceId)));
  revalidatePath("/settings");
  return { success: true };
}

export async function persistAppTokenAction(
  token: string,
  deviceType: DeviceType,
  deviceId: string,
) {
  const user = await getMembership();
  const [sub] = await db
    .insert(schema.sub)
    .values({
      userId: user.id,
      deviceId,
      deviceType,
      type: "fcm",
      data: token,
    })
    .onConflictDoUpdate({
      target: [schema.sub.userId, schema.sub.deviceId],
      set: { data: token },
    })
    .returning();
  invariant(sub, "no sub created");

  revalidatePath("/settings");
  return sub;
}
