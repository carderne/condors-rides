import { Container } from "@/components/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1 } from "@/components/ui/typography";
import { db, schema } from "@/db";
import { and, count, countDistinct, eq, inArray, isNull, sql } from "drizzle-orm";
import { RidesPerWeekChart } from "./rides-per-week-chart";

async function getDashboardStats() {
  // Total rides and by surface
  const totalRides = await db
    .select({ count: count() })
    .from(schema.ride)
    .where(and(isNull(schema.ride.canceledAt), isNull(schema.ride.deletedAt)));

  const ridesBySurface = await db
    .select({
      surface: schema.ride.surface,
      count: count(),
    })
    .from(schema.ride)
    .where(and(isNull(schema.ride.canceledAt), isNull(schema.ride.deletedAt)))
    .groupBy(schema.ride.surface);

  // Most popular days for rides
  const popularDays = await db
    .select({
      dayOfWeek: sql<string>`EXTRACT(DOW FROM ${schema.ride.date})`,
      dayName: sql<string>`TO_CHAR(${schema.ride.date}, 'Day')`,
      count: count(),
    })
    .from(schema.ride)
    .where(and(isNull(schema.ride.canceledAt), isNull(schema.ride.deletedAt)))
    .groupBy(sql`EXTRACT(DOW FROM ${schema.ride.date})`, sql`TO_CHAR(${schema.ride.date}, 'Day')`)
    .orderBy(sql`count(*) DESC`)
    .limit(3);

  // Average riders per ride
  const avgRidersPerRide = await db
    .select({
      avgRiders: sql<number>`ROUND(AVG(member_count), 1)`,
    })
    .from(
      db
        .select({
          rideId: schema.rideMember.rideId,
          memberCount: sql<number>`COUNT(*)`.as("member_count"),
        })
        .from(schema.rideMember)
        .leftJoin(schema.ride, eq(schema.ride.id, schema.rideMember.rideId))
        .where(and(isNull(schema.ride.canceledAt), isNull(schema.ride.deletedAt)))
        .groupBy(schema.rideMember.rideId)
        .as("ride_counts"),
    );

  // Unique ride leaders
  const uniqueLeaders = await db
    .select({ count: countDistinct(schema.ride.userId) })
    .from(schema.ride)
    .where(and(isNull(schema.ride.canceledAt), isNull(schema.ride.deletedAt)));

  // Unique ride members
  const uniqueMembers = await db
    .select({ count: countDistinct(schema.rideMember.userId) })
    .from(schema.rideMember)
    .leftJoin(schema.ride, eq(schema.ride.id, schema.rideMember.rideId))
    .where(and(isNull(schema.ride.canceledAt), isNull(schema.ride.deletedAt)));

  // Rides per week for the last 12 months, grouped by surface
  const ridesPerWeekBySurface = await db
    .select({
      week: sql<string>`TO_CHAR(DATE_TRUNC('week', ${schema.ride.date}), 'YYYY-MM-DD')`,
      weekLabel: sql<string>`TO_CHAR(DATE_TRUNC('week', ${schema.ride.date}), 'Mon DD')`,
      surface: sql<"road" | "offroad" | "virtual">`${schema.ride.surface}`,
      count: count(),
    })
    .from(schema.ride)
    .where(
      and(
        isNull(schema.ride.canceledAt),
        isNull(schema.ride.deletedAt),
        sql`${schema.ride.date} >= CURRENT_DATE - INTERVAL '12 months'`,
        sql`${schema.ride.date} <= CURRENT_DATE`,
        inArray(schema.ride.surface, ["road", "offroad", "virtual"]),
      ),
    )
    .groupBy(sql`DATE_TRUNC('week', ${schema.ride.date})`, schema.ride.surface)
    .orderBy(sql`DATE_TRUNC('week', ${schema.ride.date})`);

  // Total routes and by surface
  const totalRoutes = await db.select({ count: count() }).from(schema.route);
  const routesBySurface = await db
    .select({
      surface: schema.route.surface,
      count: count(),
    })
    .from(schema.route)
    .groupBy(schema.route.surface);

  return {
    totalRides: totalRides[0]?.count || 0,
    ridesBySurface,
    popularDays,
    avgRidersPerRide: avgRidersPerRide[0]?.avgRiders || 0,
    uniqueLeaders: uniqueLeaders[0]?.count || 0,
    uniqueMembers: uniqueMembers[0]?.count || 0,
    totalRoutes: totalRoutes[0]?.count || 0,
    routesBySurface,
    ridesPerWeekBySurface,
  };
}

export default async function StatsPage() {
  const stats = await getDashboardStats();

  return (
    <Container className="mt-4">
      <H1>Stats</H1>

      {/* Key Metrics */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-sm font-medium">Total Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary text-3xl font-bold">{stats.totalRides}</div>
          </CardContent>
        </Card>

        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-sm font-medium">Ride Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary text-3xl font-bold">{stats.uniqueLeaders}</div>
          </CardContent>
        </Card>

        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-sm font-medium">Ride Joiners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary text-3xl font-bold">{stats.uniqueMembers}</div>
          </CardContent>
        </Card>

        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-sm font-medium">Avg Riders/Ride</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary text-3xl font-bold">{stats.avgRidersPerRide}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rides per Week Chart */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Rides per Week</CardTitle>
          </CardHeader>
          <CardContent>
            <RidesPerWeekChart data={stats.ridesPerWeekBySurface} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rides by Surface */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Rides by Surface</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.ridesBySurface.map((item) => (
              <div key={item.surface} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                  <span className="font-medium capitalize">{item.surface}</span>
                </div>
                <span className="text-primary text-2xl font-bold">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Routes by Surface */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Routes by Surface</CardTitle>
            <p className="text-sm text-gray-600">Total: {stats.totalRoutes} routes</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.routesBySurface.map((item) => (
              <div key={item.surface} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                  <span className="font-medium capitalize">{item.surface}</span>
                </div>
                <span className="text-primary text-2xl font-bold">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Popular Days */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Most Popular Days for Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {stats.popularDays.map((day, index) => (
                <div key={day.dayOfWeek} className="text-center">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      #{index + 1} Most Popular
                    </span>
                  </div>
                  <div className="text-primary mb-1 text-2xl font-bold">{day.count}</div>
                  <div className="text-lg font-semibold text-gray-900">{day.dayName.trim()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
