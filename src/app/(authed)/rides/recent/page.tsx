import { emitPageView } from "@/clients/posthog";
import { groupRidesByDate } from "@/components/rides/list";
import { GenericRidesPage } from "@/components/rides/rides-page";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { subMonths } from "date-fns";
import { and, desc, gt, isNull, lt } from "drizzle-orm";

export default async function RecentRides() {
  const user = await getMembership();
  emitPageView({ user, page: "rides_recent" });
  const rides = await db.query.ride.findMany({
    where: and(
      isNull(schema.ride.deletedAt),
      lt(schema.ride.date, new Date()),
      gt(schema.ride.date, subMonths(new Date(), 1)),
    ),
    with: { leader: true, members: true },
    orderBy: [desc(schema.ride.date), schema.ride.time, schema.ride.slug],
  });
  const datedRideArray = groupRidesByDate(rides);
  return <GenericRidesPage rides={datedRideArray} user={user} showArchive={true} />;
}
