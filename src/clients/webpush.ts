import { getConfig } from "@/lib/config";
import type { PushSubscription } from "web-push";
import webpush from "web-push";
import { emitEvent, type PosthogEvent } from "./posthog";

const config = getConfig();

webpush.setVapidDetails("mailto:condors@rdrn.me", config.vapid.public, config.vapid.private);

interface UserNotification {
  id: string;
  webpushSub: PushSubscription;
}

export async function sendNotifications({
  users,
  title,
  body,
  event,
  slug,
  properties,
}: {
  users: UserNotification[];
  title: string;
  body: string;
  event: PosthogEvent;
  slug: string;
  properties: Record<string, string>;
}) {
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
