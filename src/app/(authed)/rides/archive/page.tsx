import { emitPageView } from "@/clients/posthog";
import { groupRidesByDate } from "@/components/rides/list";
import { GenericRidesPage } from "@/components/rides/rides-page";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { isVerified } from "@/lib/permissions";
import { subMonths } from "date-fns";
import { and, desc, isNull, lte } from "drizzle-orm";

export default async function ArchiveRides() {
  const user = await getMembership();
  const blockAccess = !isVerified(user);
  emitPageView({ user, page: "rides_archive" });

  const rides = blockAccess
    ? []
    : await db.query.ride.findMany({
        where: and(isNull(schema.ride.deletedAt), lte(schema.ride.date, subMonths(new Date(), 1))),
        with: { leader: true, members: true },
        orderBy: [desc(schema.ride.date), schema.ride.time, schema.ride.slug],
      });
  const datedRideArray = groupRidesByDate(rides);
  return <GenericRidesPage rides={datedRideArray} user={user} blockAccess={blockAccess} />;
}
