import type { PushSubscription } from "web-push";
import { Firebase } from "./firebase";
import { emitEvent } from "./posthog";
import { webpush } from "./webpush";

type SubVapid = { userId: string; deviceId: string; data: PushSubscription };
type SubFcm = { userId: string; deviceId: string; data: string };
type SubTarget = { userId: string; deviceId: string; data: string | PushSubscription };

export async function sendNotifications({
  targets,
  title,
  body,
  slug,
  properties: rawProperties,
}: {
  targets: SubTarget[];
  title: string;
  body: string;
  slug: string;
  properties: Record<string, string>;
}) {
  const properties = { ...rawProperties, slug };
  const event = "notification";
  const firebase = new Firebase();
  await firebase.auth();
  await Promise.all([
    ...targets
      .filter((target): target is SubVapid => typeof target.data !== "string")
      .map(async ({ userId, deviceId, data }) => {
        emitEvent({ user: { id: userId }, event, properties });
        try {
          await webpush.sendNotification(data, JSON.stringify({ title, body, slug }));
        } catch (_) {
          console.warn("VAPID notify failed", { userId, deviceId });
        }
      }),
    ...targets
      .filter((target): target is SubFcm => typeof target.data === "string")
      .map(async ({ userId, deviceId, data }) => {
        emitEvent({ user: { id: userId }, event, properties });
        try {
          await firebase.sendNotification({ token: data, title, body, slug });
        } catch (_) {
          console.warn("FCM notify failed", { userId, deviceId });
        }
      }),
  ]);
}
