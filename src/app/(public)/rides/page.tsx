import { groupRidesByDate, RideList } from "@/components/rides/list";
import { H3 } from "@/components/ui/typography";
import { db, schema } from "@/db";
import { and, gte, isNull } from "drizzle-orm";

export default async function UpcomingRidesPage() {
  const rides = await db.query.ride.findMany({
    where: and(isNull(schema.ride.deletedAt), gte(schema.ride.date, new Date())),
    with: { leader: true, members: true },
    orderBy: [schema.ride.date, schema.ride.time],
  });
  const datedRideArray = groupRidesByDate(rides);

  return (
    <main className="flex flex-col gap-16">
      {datedRideArray.length === 0 ? (
        <div className="mx-auto mt-20">
          <H3>No upcoming rides! :(</H3>
        </div>
      ) : (
        <RideList datedRideArray={datedRideArray} />
      )}
    </main>
  );
}
