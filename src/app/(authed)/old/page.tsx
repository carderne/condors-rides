import { RideList } from "@/components/rides/ride-list";
import { H2 } from "@/components/ui/typography";
import { db, schema } from "@/db";
import { lt } from "drizzle-orm";

export default async function OldRides() {
  const rides = await db.query.ride.findMany({
    where: lt(schema.ride.date, new Date()),
    with: { user: true },
    orderBy: [schema.ride.date, schema.ride.time],
  });

  return (
    <main className="flex flex-col">
      <H2>Archive</H2>
      <RideList rides={rides} />
    </main>
  );
}
