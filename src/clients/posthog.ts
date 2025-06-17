import type { Ride, User } from "@/db/zod";
import { getConfig } from "@/lib/config";
import { PostHog } from "posthog-node";

const config = getConfig();

const ENV = process.env.NODE_ENV;

export const posthog = new PostHog(config.posthog.key, {
  host: "https://eu.i.posthog.com",
});

export function posthogIdentify(user: User) {
  posthog.identify({
    distinctId: user.id,
    properties: {
      email: user.email,
      name: user.name,
      ENV,
    },
  });
}

export type PosthogEvent = "page_view" | "ride_view";

export function emitEvent({
  user,
  event,
  properties,
}: {
  user: User | null;
  event: PosthogEvent;
  properties?: Record<string, string | string[]>;
}) {
  if (user) {
    posthog.capture({
      distinctId: user.id,
      event,
      properties: { ...properties, ENV },
    });
  } else {
    posthog.capture({
      distinctId: "anonymouse",
      event,
      properties: { ...properties, $process_person_profile: false, ENV },
    });
  }
}

export type PosthogPage = "settings" | "rides_upcoming" | "rides_old" | "rides_future" | "routes";

export function emitPageView({ user, page }: { user: User | null; page: PosthogPage }) {
  return emitEvent({ event: "page_view", user, properties: { page } });
}

export function emitRideView({ user, ride }: { user: User; ride: Ride }) {
  return emitEvent({
    user,
    event: "ride_view",
    properties: { rideId: ride.id, rideSlug: ride.slug },
  });
}
