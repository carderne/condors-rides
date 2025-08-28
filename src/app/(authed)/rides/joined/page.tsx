import { emitPageView } from "@/clients/posthog";
import { groupRidesByDate } from "@/components/rides/list";
import { GenericRidesPage } from "@/components/rides/rides-page";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export default async function JoinedRides() {
  const user = await getMembership();
  emitPageView({ user, page: "rides_joined" });
  const rideLeader = alias(schema.user, "rideLeader");
  const rideMember = alias(schema.user, "rideMember");
  const joinedRides = await db
    .select({
      id: schema.ride.id,
    })
    .from(schema.ride)
    .innerJoin(rideLeader, eq(rideLeader.id, schema.ride.userId))
    .innerJoin(schema.rideMember, eq(schema.rideMember.rideId, schema.ride.id))
    .innerJoin(rideMember, eq(rideMember.id, schema.rideMember.userId))
    .where(
      and(
        isNull(schema.ride.deletedAt),
        or(eq(rideLeader.id, user.id), eq(rideMember.id, user.id)),
      ),
    );

  const rides = await db.query.ride.findMany({
    where: inArray(
      schema.ride.id,
      joinedRides.map((r) => r.id),
    ),
    with: { leader: true, members: true },
    orderBy: [desc(schema.ride.date), schema.ride.time, schema.ride.slug],
  });
  const datedRideArray = groupRidesByDate(rides);
  return <GenericRidesPage rides={datedRideArray} user={user} />;
}
