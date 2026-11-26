import { db, schema } from "@/db";
import type { User } from "@/db/zod";
import { and, count, eq, gte, inArray, isNull, lt, ne, sql } from "drizzle-orm";
import {
  archetype,
  chronotype,
  DAY_NAMES,
  longestWeekStreak,
  median,
  MONTH_NAMES,
  PERIOD_START,
  pctChange,
  periodEnd,
  plannerType,
  PREV_PERIOD_START,
  rankPosition,
  rideStart,
  timeToMinutes,
  topEntry,
  weekOfYear,
} from "./stats";

// Only include these ride surfaces in wrapped stats ("external" = races and such)
const VALID_SURFACES = ["road", "offroad", "external"] as const;

const validRide = and(
  isNull(schema.ride.canceledAt),
  isNull(schema.ride.deletedAt),
  inArray(schema.ride.surface, [...VALID_SURFACES]),
);

type Person = { name: string; image: string | null; count: number };

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
}

export async function getWrappedData(user: User) {
  const userId = user.id;
  // Only rides that have already happened (up to and including today).
  const end = periodEnd(new Date());
  const inYear = and(gte(schema.ride.date, PERIOD_START), lt(schema.ride.date, end));

  // All the user's rides (joined or led) across this year and last year.
  const [joinedRows, ledRows] = await Promise.all([
    db
      .select({ ride: schema.ride, joinedAt: schema.rideMember.createdAt })
      .from(schema.rideMember)
      .innerJoin(schema.ride, eq(schema.rideMember.rideId, schema.ride.id))
      .where(
        and(
          eq(schema.rideMember.userId, userId),
          validRide,
          gte(schema.ride.date, PREV_PERIOD_START),
          lt(schema.ride.date, end),
        ),
      ),
    db
      .select()
      .from(schema.ride)
      .where(
        and(
          eq(schema.ride.userId, userId),
          eq(schema.ride.unclaimed, false),
          validRide,
          gte(schema.ride.date, PREV_PERIOD_START),
          lt(schema.ride.date, end),
        ),
      ),
  ]);

  const byId = new Map<string, typeof schema.ride.$inferSelect>();
  for (const r of [...joinedRows.map((j) => j.ride), ...ledRows]) byId.set(r.id, r);
  const isThisYear = (d: Date) => d >= PERIOD_START;
  const allRides = [...byId.values()];
  const rides = allRides.filter((r) => isThisYear(r.date));
  const prevRides = allRides.filter((r) => !isThisYear(r.date));
  const led = ledRows.filter((r) => isThisYear(r.date));
  const rideIds = rides.map((r) => r.id);

  const km = (rs: typeof rides) => rs.reduce((s, r) => s + (r.distance ?? 0), 0);
  const totalKm = km(rides);
  const totalElevation = rides.reduce((s, r) => s + (r.elevation ?? 0), 0);
  // Averages only over rides that actually have the value filled in.
  const withDistance = rides.filter((r) => r.distance);
  const withBoth = withDistance.filter((r) => r.elevation !== null);
  const avgKm = withDistance.length ? Math.round(totalKm / withDistance.length) : 0;
  const bothKm = km(withBoth);
  const climbPerKm = bothKm ? withBoth.reduce((s, r) => s + r.elevation!, 0) / bothKm : 0;

  // Calendar: rides per week + per weekday
  const weeks = Array.from({ length: 53 }, () => 0);
  for (const r of rides) weeks[weekOfYear(r.date)]! += 1;
  const months = MONTH_NAMES.map((m, i) => ({
    month: m,
    rides: rides.filter((r) => r.date.getUTCMonth() === i).length,
  }));
  const favouriteDay = topEntry(rides.map((r) => DAY_NAMES[r.date.getUTCDay()]!));
  const weekendShare = rides.length
    ? rides.filter((r) => [0, 6].includes(r.date.getUTCDay())).length / rides.length
    : 0;

  // Clock: start times
  const startMins = rides.map((r) => timeToMinutes(r.time));
  const medianStart = median(startMins);
  const earliest = rides.reduce<(typeof rides)[number] | null>(
    (best, r) => (!best || timeToMinutes(r.time) < timeToMinutes(best.time) ? r : best),
    null,
  );

  // Planner: hours between hitting "join" and the ride starting (rides the user didn't lead)
  const leadHours = joinedRows
    .filter((j) => isThisYear(j.ride.date) && j.ride.userId !== userId)
    .map((j) => {
      const start = rideStart(j.ride.date, j.ride.time).getTime();
      return (start - j.joinedAt.getTime()) / 3_600_000;
    })
    .filter((h) => h >= 0);
  const medianLead = median(leadHours);

  // Group sizes (members + leader; unclaimed rides have no real leader)
  const memberCounts = rideIds.length
    ? await db
        .select({ rideId: schema.rideMember.rideId, n: count() })
        .from(schema.rideMember)
        .where(inArray(schema.rideMember.rideId, rideIds))
        .groupBy(schema.rideMember.rideId)
    : [];
  const memberCount = new Map(memberCounts.map((m) => [m.rideId, m.n]));
  const groupSize = new Map(
    rides.map((r) => [r.id, (memberCount.get(r.id) ?? 0) + (r.unclaimed ? 0 : 1)]),
  );
  const sizeOf = (r: (typeof rides)[number]) => groupSize.get(r.id) ?? 0;
  const biggest = rides.reduce<(typeof rides)[number] | null>(
    (best, r) => (!best || sizeOf(r) > sizeOf(best) ? r : best),
    null,
  );
  const longest = rides.reduce<(typeof rides)[number] | null>(
    (best, r) => (!best || (r.distance ?? 0) > (best.distance ?? 0) ? r : best),
    null,
  );
  const ridersLed = led.reduce((s, r) => s + (memberCount.get(r.id) ?? 0), 0);

  // Crew: everyone who was on the same rides (members + leaders)
  const [memberBuddies, leaderBuddies] = rideIds.length
    ? await Promise.all([
        db
          .select({
            id: schema.user.id,
            name: schema.user.name,
            image: schema.user.image,
            rideId: schema.rideMember.rideId,
          })
          .from(schema.rideMember)
          .innerJoin(schema.user, eq(schema.rideMember.userId, schema.user.id))
          .where(
            and(inArray(schema.rideMember.rideId, rideIds), ne(schema.rideMember.userId, userId)),
          ),
        db
          .select({
            id: schema.user.id,
            name: schema.user.name,
            image: schema.user.image,
            rideId: schema.ride.id,
          })
          .from(schema.ride)
          .innerJoin(schema.user, eq(schema.ride.userId, schema.user.id))
          .where(
            and(
              inArray(schema.ride.id, rideIds),
              ne(schema.ride.userId, userId),
              eq(schema.ride.unclaimed, false),
            ),
          ),
      ])
    : [[], []];

  const buddyMap = new Map<string, Person>();
  for (const b of [...memberBuddies, ...leaderBuddies]) {
    const existing = buddyMap.get(b.id);
    if (existing) existing.count += 1;
    else buddyMap.set(b.id, { name: b.name, image: b.image, count: 1 });
  }
  const buddies = [...buddyMap.values()].sort((a, b) => b.count - a.count);

  const leaderMap = new Map<string, Person>();
  for (const l of leaderBuddies) {
    const existing = leaderMap.get(l.id);
    if (existing) existing.count += 1;
    else leaderMap.set(l.id, { name: l.name, image: l.image, count: 1 });
  }
  const favouriteLeader = [...leaderMap.values()].sort((a, b) => b.count - a.count)[0] ?? null;

  // Places
  const favouriteCafe = topEntry(
    rides.map((r) => r.cafeStop?.trim()).filter((c) => !!c) as string[],
  );
  // Case-insensitive so "Café X" and "café x" count as the same stop.
  const topCafeVisits = topEntry(
    rides.map((r) => r.cafeStop?.trim().toLowerCase()).filter((c) => !!c) as string[],
  );
  const favouriteStart = topEntry(rides.map((r) => r.startPoint.trim()).filter(Boolean));
  const routeUrls = [...new Set(rides.map((r) => r.routeUrl).filter((u): u is string => !!u))];
  const knownRoutes = routeUrls.length
    ? await db
        .select({ url: schema.route.url, name: schema.route.name })
        .from(schema.route)
        .where(inArray(schema.route.url, routeUrls))
    : [];
  const routeNames = new Map(knownRoutes.map((r) => [r.url, r.name]));
  const topRoute = topEntry(
    rides.map((r) => r.routeUrl).filter((u): u is string => !!u && routeNames.has(u)),
  );

  // Comments posted this year
  const [commentRow] = await db
    .select({ n: count() })
    .from(schema.comment)
    .where(
      and(
        eq(schema.comment.userId, userId),
        isNull(schema.comment.deletedAt),
        gte(schema.comment.createdAt, PERIOD_START),
        lt(schema.comment.createdAt, end),
      ),
    );

  // Club-wide totals + rank
  const [clubRow] = await db
    .select({
      rides: count(),
      km: sql<number>`coalesce(sum(${schema.ride.distance}), 0)::int`,
    })
    .from(schema.ride)
    .where(and(validRide, inYear));
  const perUser = await db.execute<{ user_id: string; n: number }>(sql`
    select user_id, count(distinct ride_id)::int as n from (
      select ${schema.rideMember.userId} as user_id, ${schema.ride.id} as ride_id
        from ${schema.rideMember}
        join ${schema.ride} on ${schema.ride.id} = ${schema.rideMember.rideId}
        where ${validRide} and ${inYear}
      union all
      select ${schema.ride.userId}, ${schema.ride.id}
        from ${schema.ride}
        where ${validRide} and ${inYear} and ${schema.ride.unclaimed} = false
    ) t group by user_id order by n desc
  `);
  const ranked = perUser.rows;
  const myCount = ranked.find((r) => r.user_id === userId)?.n ?? 0;
  const position = rankPosition(
    ranked.map((r) => r.n),
    myCount,
  );
  const totalRiders = ranked.length;

  const surface = {
    road: rides.filter((r) => r.surface === "road").length,
    offroad: rides.filter((r) => r.surface === "offroad").length,
    external: rides.filter((r) => r.surface === "external").length,
  };

  return {
    user: { name: user.name, image: user.image, firstName: user.name.split(" ")[0] ?? user.name },
    rides: rides.length,
    ridesLed: led.length,
    ridersLed,
    totalKm,
    totalElevation,
    avgKm,
    prev: {
      rides: prevRides.length,
      km: km(prevRides),
      ridesChange: pctChange(rides.length, prevRides.length),
      kmChange: pctChange(totalKm, km(prevRides)),
    },
    calendar: {
      weeks,
      months,
      activeWeeks: weeks.filter((w) => w > 0).length,
      streak: longestWeekStreak(rides.map((r) => r.date)),
      favouriteDay,
      weekendShare,
    },
    clock:
      medianStart !== null && earliest
        ? {
            medianStart,
            type: chronotype(medianStart),
            earliest: {
              name: earliest.name,
              time: earliest.time.slice(0, 5),
              date: formatDate(earliest.date),
            },
          }
        : null,
    planner:
      medianLead !== null && leadHours.length >= 3
        ? {
            medianHours: medianLead,
            type: plannerType(medianLead),
            lastMinute: leadHours.filter((h) => h < 12).length,
          }
        : null,
    longest: longest?.distance
      ? { name: longest.name, distance: longest.distance, date: formatDate(longest.date) }
      : null,
    biggest:
      biggest && sizeOf(biggest) > 2
        ? { name: biggest.name, size: sizeOf(biggest), date: formatDate(biggest.date) }
        : null,
    crew: {
      peopleMet: buddies.length,
      top: buddies.slice(0, 3),
      favouriteLeader,
      comments: commentRow?.n ?? 0,
    },
    places: {
      cafe: favouriteCafe && favouriteCafe.count > 1 ? favouriteCafe : null,
      start: favouriteStart,
      distinctRoutes: routeUrls.length,
      route:
        topRoute && topRoute.count > 1
          ? { name: routeNames.get(topRoute.name)!, url: topRoute.name, count: topRoute.count }
          : null,
    },
    surface,
    club: {
      rides: clubRow?.rides ?? 0,
      km: clubRow?.km ?? 0,
      riders: totalRiders,
      shareOfRides: clubRow?.rides ? rides.length / clubRow.rides : 0,
    },
    rank: {
      position,
      total: totalRiders,
      topPercent: totalRiders ? Math.max(1, Math.ceil((position / totalRiders) * 100)) : 100,
    },
    archetype: archetype({
      rides: rides.length,
      ridesLed: led.length,
      offroadShare: rides.length ? surface.offroad / rides.length : 0,
      races: surface.external,
      avgDistance: withDistance.length ? totalKm / withDistance.length : 0,
      climbPerKm,
      topCafeVisits: topCafeVisits?.count ?? 0,
      medianStartMins: medianStart,
      weekendShare,
    }),
  };
}

export type WrappedData = Awaited<ReturnType<typeof getWrappedData>>;
