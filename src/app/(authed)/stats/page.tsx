import { Container } from "@/components/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1 } from "@/components/ui/typography";
import { db, schema } from "@/db";
import { and, count, countDistinct, eq, inArray, isNull, sql, type SQL } from "drizzle-orm";
import type { SearchParams } from "nuqs/server";
import { loadStatsParams, type StatsPeriod } from "./period-params";
import { PeriodSelect } from "./period-select";
import { RidesPerWeekChart } from "./rides-per-week-chart";

// Road/offroad only — most stats exclude virtual/event/external rides.
const roadOffroad = inArray(schema.ride.surface, ["road", "offroad"]);
// Chart & "rides by surface" include virtual too.
const chartSurfaces = inArray(schema.ride.surface, ["road", "offroad", "virtual"]);

function periodCondition(period: StatsPeriod): SQL | undefined {
  if (period === "12m") {
    return sql`${schema.ride.date} >= CURRENT_DATE - INTERVAL '12 months'`;
  }
  if (period === "agm") {
    return sql`${schema.ride.date} >= '2025-10-19'`;
  }
  return undefined;
}

async function getDashboardStats(period: StatsPeriod) {
  const inPeriod = periodCondition(period);

  // Base filter for "real" (road/offroad) rides within the selected period.
  const rideFilter = and(
    isNull(schema.ride.canceledAt),
    isNull(schema.ride.deletedAt),
    roadOffroad,
    inPeriod,
  );

  // Total rides
  const totalRides = await db.select({ count: count() }).from(schema.ride).where(rideFilter);

  // Rides by surface (includes virtual etc.)
  const ridesBySurface = await db
    .select({
      surface: schema.ride.surface,
      count: count(),
    })
    .from(schema.ride)
    .where(and(isNull(schema.ride.canceledAt), isNull(schema.ride.deletedAt), inPeriod))
    .groupBy(schema.ride.surface);

  // Most popular days for rides
  const popularDays = await db
    .select({
      dayOfWeek: sql<string>`EXTRACT(DOW FROM ${schema.ride.date})`,
      dayName: sql<string>`TO_CHAR(${schema.ride.date}, 'Day')`,
      count: count(),
    })
    .from(schema.ride)
    .where(rideFilter)
    .groupBy(sql`EXTRACT(DOW FROM ${schema.ride.date})`, sql`TO_CHAR(${schema.ride.date}, 'Day')`)
    .orderBy(sql`count(*) DESC`)
    .limit(3);

  // Median riders per ride
  const medianRidersPerRide = await db
    .select({
      median: sql<number>`ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY member_count)::numeric)`,
    })
    .from(
      db
        .select({
          rideId: schema.rideMember.rideId,
          memberCount: sql<number>`COUNT(*)`.as("member_count"),
        })
        .from(schema.rideMember)
        .leftJoin(schema.ride, eq(schema.ride.id, schema.rideMember.rideId))
        .where(rideFilter)
        .groupBy(schema.rideMember.rideId)
        .as("ride_counts"),
    );

  // Median rides per week
  const medianRidesPerWeek = await db
    .select({
      median: sql<number>`ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY week_count)::numeric, 1)`,
    })
    .from(
      db
        .select({
          week: sql<string>`DATE_TRUNC('week', ${schema.ride.date})`.as("week"),
          weekCount: sql<number>`COUNT(*)`.as("week_count"),
        })
        .from(schema.ride)
        .where(rideFilter)
        .groupBy(sql`DATE_TRUNC('week', ${schema.ride.date})`)
        .as("week_counts"),
    );

  // Unique ride leaders
  const uniqueLeaders = await db
    .select({ count: countDistinct(schema.ride.userId) })
    .from(schema.ride)
    .where(rideFilter);

  // Unique ride members
  const uniqueMembers = await db
    .select({ count: countDistinct(schema.rideMember.userId) })
    .from(schema.rideMember)
    .leftJoin(schema.ride, eq(schema.ride.id, schema.rideMember.rideId))
    .where(rideFilter);

  // Weekly chart data, grouped by surface (includes virtual).
  const weekly = await db
    .select({
      week: sql<string>`TO_CHAR(DATE_TRUNC('week', ${schema.ride.date}), 'YYYY-MM-DD')`,
      weekLabel: sql<string>`TO_CHAR(DATE_TRUNC('week', ${schema.ride.date}), 'Mon DD')`,
      surface: sql<"road" | "offroad" | "virtual">`${schema.ride.surface}`,
      rides: sql<number>`COUNT(DISTINCT ${schema.ride.id})`,
      riders: sql<number>`COUNT(${schema.rideMember.userId})`,
      riderKms: sql<number>`COALESCE(SUM(CASE WHEN ${schema.rideMember.userId} IS NOT NULL THEN ${schema.ride.distance} ELSE 0 END), 0)`,
    })
    .from(schema.ride)
    .leftJoin(schema.rideMember, eq(schema.rideMember.rideId, schema.ride.id))
    .where(
      and(
        isNull(schema.ride.canceledAt),
        isNull(schema.ride.deletedAt),
        sql`${schema.ride.date} <= CURRENT_DATE`,
        chartSurfaces,
        inPeriod,
      ),
    )
    .groupBy(sql`DATE_TRUNC('week', ${schema.ride.date})`, schema.ride.surface)
    .orderBy(sql`DATE_TRUNC('week', ${schema.ride.date})`);

  // Total routes and by surface (not affected by period).
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
    medianRidersPerRide: medianRidersPerRide[0]?.median || 0,
    medianRidesPerWeek: medianRidesPerWeek[0]?.median || 0,
    uniqueLeaders: uniqueLeaders[0]?.count || 0,
    uniqueMembers: uniqueMembers[0]?.count || 0,
    totalRoutes: totalRoutes[0]?.count || 0,
    routesBySurface,
    weekly,
  };
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { period } = await loadStatsParams(searchParams);

  const stats = await getDashboardStats(period);

  return (
    <Container className="mt-4">
      <div className="flex items-center justify-between">
        <H1>Stats</H1>
        <PeriodSelect />
      </div>

      {/* Key Metrics */}
      <div className="mt-4 mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-primary text-sm font-medium">Median Riders/Ride</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary text-3xl font-bold">{stats.medianRidersPerRide}</div>
          </CardContent>
        </Card>

        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-sm font-medium">Median Rides/Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-primary text-3xl font-bold">{stats.medianRidesPerWeek}</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <RidesPerWeekChart data={stats.weekly} />
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
