import { groupRidesByDate } from "@/components/rides/list";
import { GenericRidesPage } from "@/components/rides/rides-page";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { addDays } from "date-fns";
import { and, gte, isNull } from "drizzle-orm";

export default async function FutureRidesPage() {
  const user = await getMembership();
  const rides = await db.query.ride.findMany({
    where: and(isNull(schema.ride.deletedAt), gte(schema.ride.date, addDays(new Date(), 10))),
    with: { leader: true, members: true },
    orderBy: [schema.ride.date, schema.ride.time, schema.ride.slug],
  });
  const datedRideArray = groupRidesByDate(rides);
  return <GenericRidesPage rides={datedRideArray} user={user} />;
}
