import { emitPageView } from "@/clients/posthog";
import { H2 } from "@/components/ui/typography";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { invariant } from "@/lib/invariant";
import { and, eq, isNull } from "drizzle-orm";
import { ShareIcon } from "lucide-react";
import Link from "next/link";
import { UserSettingsForm } from "./form";
import { PushNotificationManager } from "./notifications";

export default async function SettingsPage() {
  const user = await getMembership();
  emitPageView({ user, page: "settings" });
  const userHydrated = await db.query.user.findFirst({
    where: eq(schema.user.id, user.id),
    with: {
      ridesJoined: true,
      rides: {
        where: and(
          isNull(schema.ride.canceledAt),
          isNull(schema.ride.deletedAt),
          eq(schema.ride.unclaimed, false),
        ),
      },
    },
  });
  invariant(userHydrated);

  const stats = [
    { label: "Rides led", value: userHydrated.rides.length },
    { label: "Rides joined", value: userHydrated.ridesJoined.length },
  ];

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <H2>Notifications</H2>
        <PushNotificationManager />
      </div>

      <div className="space-y-2">
        <H2>User settings</H2>
        <UserSettingsForm user={user} />
      </div>

      <div className="space-y-2">
        <H2>Stats</H2>
        <div className="flex gap-4 md:flex-row md:gap-8">
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1 md:items-start">
              <span className="text-sm font-medium text-gray-600">{label}</span>
              <span className="text-2xl font-bold">{value}</span>
            </div>
          ))}
        </div>
        <Link href="/stats" className="text-primary hover:underline">
          More here...
        </Link>
      </div>

      <div className="space-y-2">
        <H2>Install on mobile</H2>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="text-primary font-medium">1</span>
            <span className="text-foreground flex">
              Tap <ShareIcon className="ml-2 inline h-4 w-4 align-text-bottom" />
            </span>
          </li>

          <li className="flex items-start gap-3">
            <span className="text-primary font-medium">2</span>
            <span className="text-foreground">
              Scroll down and <span className="font-medium">Add to Home Screen</span>
            </span>
          </li>

          <li className="flex items-start gap-3">
            <span className="text-primary font-medium">3</span>
            <span className="text-foreground">
              Tap <span className="font-medium">Add</span> to confirm
            </span>
          </li>
        </ol>
      </div>

      <div className="space-y-2">
        <H2>Data management</H2>
        <p className="">To delete all your data, please contact the club:</p>
        <Link
          className="text-primary hover:underline"
          href="https://cowleyroadcondors.cc/contact-us/"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
