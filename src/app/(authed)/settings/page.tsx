import { emitPageView } from "@/clients/posthog";
import { H2 } from "@/components/ui/typography";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { invariant } from "@/lib/invariant";
import { and, eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { UserSettingsForm } from "./form";

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
      <H2>User settings</H2>
      <UserSettingsForm user={user} />
      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1 md:items-start">
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <span className="text-2xl font-bold">{value}</span>
          </div>
        ))}
      </div>
      <p className="mt-10">To delete all your data, please contact the club:</p>
      <Link className="text-primary text-xl" href="https://cowleyroadcondors.cc/contact-us/">
        Contact us
      </Link>
    </div>
  );
}
