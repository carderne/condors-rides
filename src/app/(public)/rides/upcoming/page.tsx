import { emitPageView, posthogIdentify } from "@/clients/posthog";
import { groupRidesByDate } from "@/components/rides/list";
import { GenericRidesPage } from "@/components/rides/rides-page";
import { maybeGetMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { addDays } from "date-fns";
import { and, eq, getTableColumns, gte, isNull, lt } from "drizzle-orm";

export default async function UpcomingRidesPage() {
  const user = await maybeGetMembership();
  if (user) {
    posthogIdentify(user);
  }
  emitPageView({ user, page: "rides_upcoming" });
  const rides = await db.query.ride.findMany({
    where: and(
      isNull(schema.ride.deletedAt),
      gte(schema.ride.date, new Date()),
      lt(schema.ride.date, addDays(new Date(), 10)),
    ),
    with: { leader: true, members: true },
    orderBy: [schema.ride.date, schema.ride.time, schema.ride.slug],
  });
  const datedRideArray = groupRidesByDate(rides);

  const surveys = user
    ? await db
        .select({ ...getTableColumns(schema.survey) })
        .from(schema.survey)
        .leftJoin(schema.surveyResponse, eq(schema.surveyResponse.surveyId, schema.survey.id))
        .where(and(eq(schema.survey.active, true), isNull(schema.surveyResponse.id)))
    : [];

  return <GenericRidesPage rides={datedRideArray} user={user} surveys={surveys} />;
}
