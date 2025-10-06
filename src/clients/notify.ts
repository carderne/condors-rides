import type { Sub } from "@/db/zod";
import type { PushSubscription } from "web-push";
import { Firebase } from "./firebase";
import { emitEvent } from "./posthog";
import { webpush } from "./webpush";

export type SubTarget = Pick<Sub, "userId" | "data">;
export type SubVapid = { userId: string; data: PushSubscription };
export type SubFcm = { userId: string; data: string };

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
      .map(async ({ userId, data }) => {
        emitEvent({ user: { id: userId }, event, properties });
        try {
          await webpush.sendNotification(data, JSON.stringify({ title, body, slug }));
        } catch (err) {
          console.warn("VAPID notify failed", { userId, err });
        }
      }),
    ...targets
      .filter((target): target is SubFcm => typeof target.data === "string")
      .map(async ({ userId, data }) => {
        emitEvent({ user: { id: userId }, event, properties });
        try {
          await firebase.sendNotification(data, title, body);
        } catch (err) {
          console.warn("FCM notify failed", { userId, err });
        }
      }),
  ]);
}

export { webpush };
