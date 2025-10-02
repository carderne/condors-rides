"use server";

import { emitEvent } from "@/clients/posthog";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import type { PushSubscription } from "web-push";

export async function subscribeUserAction(sub: PushSubscription) {
  const user = await getMembership();

  await db
    .update(schema.user)
    .set({
      webpushSub: sub,
    })
    .where(eq(schema.user.id, user.id));

  return { success: true };
}

export async function unsubscribeUserAction() {
  const user = await getMembership();

  await db
    .update(schema.user)
    .set({
      webpushSub: null,
    })
    .where(eq(schema.user.id, user.id));
  return { success: true };
}

export async function setNewRideNotificationAction(enabled: boolean) {
  const user = await getMembership();

  await db
    .update(schema.user)
    .set({
      notifyNewRide: enabled,
    })
    .where(eq(schema.user.id, user.id));
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
