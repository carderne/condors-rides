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
  const properties = { ...rawProperties, slug };
  const event = "notification";
  const firebase = new Firebase();
  await firebase.auth();
  await Promise.all([
    ...targets.map(async ({ userId, deviceId, token }) => {
      emitEvent({ user: { id: userId }, event, properties });
      try {
        await firebase.sendNotification({ token, title, body, slug });
      } catch (_) {
        console.warn("FCM notify failed", { userId, deviceId });
      }
    }),
  ]);
}
