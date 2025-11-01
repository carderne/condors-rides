import { Firebase } from "./firebase";
import { emitEvent } from "./posthog";

type SubTarget = { userId: string; deviceId: string; token: string };

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
  if (targets.length === 0) {
    return;
  }

  const properties = { ...rawProperties, slug };
  const event = "notification";
  const firebase = new Firebase();
  const t0 = performance.now();
  await firebase.auth();
  const t1 = performance.now();
  await Promise.all(
    targets.map(async ({ userId, deviceId, token }) => {
      emitEvent({ user: { id: userId }, event, properties });
      try {
        await firebase.sendNotification({ token, title, body, slug });
      } catch (_) {
        console.warn("FCM notify failed", { userId, deviceId });
      }
    }),
  );
  const t2 = performance.now();
  const authTimeMs = t1 - t0;
  const notiTimeMs = t2 - t1;
  const numNotifications = targets.length;
  emitEvent({
    user: null,
    event: "notification_perf",
    properties: { authTimeMs, notiTimeMs, numNotifications, slug },
  });
}
