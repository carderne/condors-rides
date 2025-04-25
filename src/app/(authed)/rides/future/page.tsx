import { groupRidesByDate, RideList } from "@/components/rides/list";
import { RidesTabSwitcher } from "@/components/rides/tabs";
import { H3 } from "@/components/ui/typography";
import { db, schema } from "@/db";
import { addDays } from "date-fns";
import { and, gte, isNull } from "drizzle-orm";

export default async function FutureRidesPage() {
  const rides = await db.query.ride.findMany({
    where: and(isNull(schema.ride.deletedAt), gte(schema.ride.date, addDays(new Date(), 10))),
    with: { leader: true, members: true },
    orderBy: [schema.ride.date, schema.ride.time, schema.ride.slug],
  });
  const datedRideArray = groupRidesByDate(rides);

  return (
    <main className="flex flex-col gap-16">
      <RidesTabSwitcher />
      {datedRideArray.length === 0 ? (
        <div className="mx-auto mt-20">
          <H3>No future rides! :(</H3>
        </div>
      ) : (
        <RideList datedRideArray={datedRideArray} />
      )}
    </main>
  );
}
