import { RideList } from "@/components/rides/ride-list";
import { H2 } from "@/components/ui/typography";
import { db, schema } from "@/db";
import { and, gte, isNull } from "drizzle-orm";

export default async function RidesPage() {
  const rides = await db.query.ride.findMany({
    where: and(isNull(schema.ride.deletedAt), gte(schema.ride.date, new Date())),
    with: { leader: true },
    orderBy: [schema.ride.date, schema.ride.time],
  });

  return (
    <main className="flex flex-col">
      <H2>Upcoming rides</H2>
      <RideList rides={rides} />
    </main>
  );
}
