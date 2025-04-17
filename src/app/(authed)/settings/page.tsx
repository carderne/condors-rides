import { H2 } from "@/components/ui/typography";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { invariant } from "@/lib/invariant";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function SettingsPage() {
  const user = await getMembership();
  const userHydrated = await db.query.user.findFirst({
    where: eq(schema.user.id, user.id),
    with: { rides: true },
  });
  invariant(userHydrated);
  return (
    <div>
      <H2>User settings</H2>
      <div>Name: {user.name}</div>
      <div>Email: {user.email}</div>
      <div>Rides led: {userHydrated.rides.length}</div>
      <p className="mt-10">
        To delete all your data, please contact the club at{" "}
        <Link href="mailto:info@cowleyroadcondors.cc" className="text-primary">
          info@cowleyroadcondors.cc
        </Link>
      </p>
    </div>
  );
}
