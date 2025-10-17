import { emitPageView } from "@/clients/posthog";
import { Confirmation } from "@/components/confirmation";
import { Container } from "@/components/container";
import { PushNotificationManager } from "@/components/notifications/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { H2 } from "@/components/ui/typography";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { invariant } from "@/lib/invariant";
import { and, eq, isNull } from "drizzle-orm";
import { SunsetIcon } from "lucide-react";
import Link from "next/link";
import { deleteAccountAction } from "./actions";
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
    <Container className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <H2>Notifications</H2>
        </CardHeader>
        <CardContent>
          <PushNotificationManager />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <H2>User settings</H2>
        </CardHeader>
        <CardContent>
          <UserSettingsForm user={user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <H2>Stats</H2>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <H2>Data management</H2>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>To delete your account, click below:</p>
          <Confirmation
            title="Confirm account deletion"
            description="This will take up to a week to be finalised, but you will lose access immediately."
            action={deleteAccountAction}
          >
            <Button
              variant="destructive"
              className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 hover:text-red-600"
            >
              <SunsetIcon className="size-4" />
              Delete
            </Button>
          </Confirmation>
        </CardContent>
      </Card>
    </Container>
  );
}
