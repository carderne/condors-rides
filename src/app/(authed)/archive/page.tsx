import { groupRidesByDate, RideList } from "@/components/rides/list";
import { db, schema } from "@/db";
import { and, isNull, lt } from "drizzle-orm";

export default async function OldRides() {
  const rides = await db.query.ride.findMany({
    where: and(isNull(schema.ride.deletedAt), lt(schema.ride.date, new Date())),
    with: { leader: true, members: true },
    orderBy: [schema.ride.date, schema.ride.time],
  });
  const datedRideArray = groupRidesByDate(rides);

  return (
    <main className="flex flex-col gap-16">
      <RideList datedRideArray={datedRideArray} />
    </main>
  );
}
