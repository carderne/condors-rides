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
  return (
    <div className="grid gap-4">
      <H2>User settings</H2>
      <UserSettingsForm user={user} />
      <div className="flex w-full flex-col items-center gap-1 md:flex-row md:gap-4">
        <p className="mb-0 flex flex-row items-center gap-2 text-xl md:w-32 md:flex-col md:gap-0">
          Rides led:
        </p>
        <p>{userHydrated.rides.length}</p>
      </div>
      <p className="mt-10">To delete all your data, please contact the club:</p>
      <Link className="text-primary text-xl" href="https://cowleyroadcondors.cc/contact-us/">
        Contact us
      </Link>
    </div>
  );
}
