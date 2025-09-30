import { getConfig } from "@/lib/config";
import type { PushSubscription } from "web-push";
import webpush from "web-push";
import { emitEvent } from "./posthog";

const config = getConfig();

webpush.setVapidDetails("mailto:condors@rdrn.me", config.vapid.public, config.vapid.private);

export interface UserNotification {
  id: string;
  webpushSub: PushSubscription;
}

export async function sendNotifications({
  users,
  title,
  body,
  slug,
  properties: rawProperties,
}: {
  users: UserNotification[];
  title: string;
  body: string;
  slug: string;
  properties: Record<string, string>;
}) {
  const properties = { ...rawProperties, slug };
  const event = "notification";
  const notifications = await Promise.allSettled(
    users.map(async (user) => {
      emitEvent({ user, event, properties });
      await webpush.sendNotification(user.webpushSub, JSON.stringify({ title, body, slug }));
    }),
  );
  notifications.forEach((r, i) => {
    if (r.status === "rejected") {
      console.warn("Push failed for:", users[i], r.reason);
    }
  });
}

export { webpush };
