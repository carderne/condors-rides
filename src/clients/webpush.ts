import type { Sub } from "@/db/zod";
import { getConfig } from "@/lib/config";
import type { PushSubscription } from "web-push";
import webpush from "web-push";
import { emitEvent } from "./posthog";

const config = getConfig();

webpush.setVapidDetails("mailto:condors@rdrn.me", config.vapid.public, config.vapid.private);

export type SubTarget = Pick<Sub, "userId" | "data">;
export type SubVapid = SubTarget & { data: PushSubscription };

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
  const notifications = await Promise.allSettled(
    targets
      .filter((target): target is SubVapid => typeof target.data !== "string")
      .map(async ({ userId, data }) => {
        emitEvent({ user: { id: userId }, event, properties });
        await webpush.sendNotification(data, JSON.stringify({ title, body, slug }));
      }),
  );
  notifications.forEach((r, i) => {
    if (r.status === "rejected") {
      console.warn("Push failed for:", targets[i], r.reason);
    }
  });

  // TODO do FCM notifications
}

export { webpush };
