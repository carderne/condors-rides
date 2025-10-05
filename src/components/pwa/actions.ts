"use server";

import { emitEvent } from "@/clients/posthog";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import type { DeviceType } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { PushSubscription } from "web-push";

export async function getSub(deviceId: string) {
  const user = await getMembership();

  const sub = await db.query.sub.findFirst({
    where: and(eq(schema.sub.userId, user.id), eq(schema.sub.deviceId, deviceId)),
  });

  return sub;
}

export async function updateDeviceDetailsAction(deviceType: DeviceType, deviceId: string) {
  const user = await getMembership();

  await db
    .update(schema.sub)
    .set({
      deviceType,
      deviceId,
    })
    .where(eq(schema.sub.userId, user.id));
}

export async function subscribeUserAction(
  sub: PushSubscription,
  deviceType: DeviceType,
  deviceId: string,
) {
  const user = await getMembership();

  await db
    .insert(schema.sub)
    .values({
      userId: user.id,
      deviceId,
      deviceType,
      type: "vapid",
      data: sub,
    })
    .onConflictDoUpdate({
      target: [schema.sub.userId, schema.sub.deviceId],
      set: { data: sub },
    });

  revalidatePath("/settings");
  return { success: true };
}

export async function unsubscribeUserAction() {
  const user = await getMembership();
  await db.delete(schema.sub).where(eq(schema.sub.userId, user.id));
  return { success: true };
}

export async function setRideUpdateNotificationAction(enabled: boolean) {
  const user = await getMembership();
  await db.update(schema.sub).set({ rideUpdate: enabled }).where(eq(schema.sub.userId, user.id));
  revalidatePath("/settings");
  return { success: true };
}

export async function setRideNewNotificationAction(enabled: boolean) {
  const user = await getMembership();
  await db.update(schema.sub).set({ rideNew: enabled }).where(eq(schema.sub.userId, user.id));
  revalidatePath("/settings");
  return { success: true };
}

export async function clickedInstallAction() {
  const user = await getMembership();
  emitEvent({ user, event: "btn_click", properties: { button: "install_pwa" } });
}

export async function clickedNotifyAction() {
  const user = await getMembership();
  emitEvent({ user, event: "btn_click", properties: { button: "notifications" } });
}

export async function persistAppTokenAction(
  token: string,
  deviceType: DeviceType,
  deviceId: string,
) {
  const user = await getMembership();
  await db
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
    });

  return { success: true };
}
