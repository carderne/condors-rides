"use server";

import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { and, count, desc, eq, gte, inArray, isNull, lt, sql } from "drizzle-orm";
import type { WrappedData } from "./components/types";

// Only include these ride surfaces in wrapped stats
type Surface = "road" | "offroad" | "virtual";
const VALID_SURFACES: Surface[] = ["road", "offroad", "virtual"];

export async function getWrappedDataAction(): Promise<WrappedData> {
  const user = await getMembership();
  const userId = user.id;

  const startOf2025 = new Date("2025-01-01");
  const endOf2025 = new Date("2026-01-01");

  // Base conditions for valid rides
  const validRideConditions = and(
    gte(schema.ride.date, startOf2025),
    lt(schema.ride.date, endOf2025),
    isNull(schema.ride.canceledAt),
    isNull(schema.ride.deletedAt),
    inArray(schema.ride.surface, VALID_SURFACES),
  );

  // Get all rides the user joined (as member) in 2025
  const ridesJoinedData = await db
    .select({
      ride: schema.ride,
    })
    .from(schema.rideMember)
    .innerJoin(schema.ride, eq(schema.rideMember.rideId, schema.ride.id))
    .where(and(eq(schema.rideMember.userId, userId), validRideConditions));

  // Get all rides the user led in 2025 (excluding unclaimed rides)
  const ridesLedData = await db
    .select()
    .from(schema.ride)
    .where(
      and(eq(schema.ride.userId, userId), eq(schema.ride.unclaimed, false), validRideConditions),
    );

  // Combine all rides (both led and joined)
  const allUserRides = [...ridesJoinedData.map((r) => r.ride), ...ridesLedData];
  const uniqueRideIds = [...new Set(allUserRides.map((r) => r.id))];
  const uniqueRides = uniqueRideIds.map((id) => allUserRides.find((r) => r.id === id)!);

  const ridesJoined = uniqueRides.length;
  const ridesLed = ridesLedData.length;

  // Calculate total km and elevation
  const totalKm = uniqueRides.reduce((sum, r) => sum + (r.distance || 0), 0);
  const totalElevation = uniqueRides.reduce((sum, r) => sum + (r.elevation || 0), 0);

  // Find longest ride
  const longestRide =
    uniqueRides.length > 0
      ? uniqueRides.reduce((longest, r) =>
          (r.distance || 0) > (longest.distance || 0) ? r : longest,
        )
      : null;

  // Find biggest group ride (by member count)
  const rideMemberCounts =
    uniqueRideIds.length > 0
      ? await db
          .select({
            rideId: schema.rideMember.rideId,
            memberCount: count(),
          })
          .from(schema.rideMember)
          .where(inArray(schema.rideMember.rideId, uniqueRideIds))
          .groupBy(schema.rideMember.rideId)
          .orderBy(desc(count()))
      : [];

  // Add 1 to member count for the leader
  const biggestGroupRideData = rideMemberCounts[0];
  const biggestGroupRide = biggestGroupRideData
    ? uniqueRides.find((r) => r.id === biggestGroupRideData.rideId)
    : null;
  const biggestGroup =
    biggestGroupRide && biggestGroupRideData
      ? {
          name: biggestGroupRide.name,
          date: biggestGroupRide.date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
          }),
          memberCount: biggestGroupRideData.memberCount + 1, // +1 for leader
        }
      : null;

  // Favourite route - only count routes that exist in the route table
  const ridesWithRoutes = uniqueRides.filter((r) => r.routeUrl);
  const routeUrls = ridesWithRoutes.map((r) => r.routeUrl).filter(Boolean) as string[];

  let favouriteRoute: { name: string; url: string; count: number } | null = null;
  if (routeUrls.length > 0) {
    // Count occurrences of each route URL
    const routeUrlCounts = ridesWithRoutes.reduce(
      (acc, r) => {
        if (r.routeUrl) {
          acc[r.routeUrl] = (acc[r.routeUrl] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    // Get route details from route table
    const uniqueRouteUrls = [...new Set(routeUrls)];
    const routes = await db
      .select({
        url: schema.route.url,
        name: schema.route.name,
      })
      .from(schema.route)
      .where(inArray(schema.route.url, uniqueRouteUrls));

    // Find the most ridden route that exists in the route table
    const routeMap = new Map(routes.map((r) => [r.url, r.name]));
    const sortedRouteUrls = Object.entries(routeUrlCounts)
      .filter(([url]) => routeMap.has(url))
      .sort((a, b) => b[1] - a[1]);

    const topRouteEntry = sortedRouteUrls[0];
    if (topRouteEntry && topRouteEntry[1] > 1) {
      favouriteRoute = {
        name: routeMap.get(topRouteEntry[0]) || "Unknown Route",
        url: topRouteEntry[0],
        count: topRouteEntry[1],
      };
    }
  }

  // Favourite cafe stop
  const cafeCounts = uniqueRides.reduce(
    (acc, r) => {
      if (r.cafeStop && r.cafeStop.trim()) {
        acc[r.cafeStop] = (acc[r.cafeStop] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );
  const sortedCafes = Object.entries(cafeCounts).sort((a, b) => b[1] - a[1]);
  const topCafe = sortedCafes[0];
  const favouriteCafe = topCafe && topCafe[1] > 1 ? { name: topCafe[0], count: topCafe[1] } : null;

  // Top riding buddies - people who were on the same rides as the user
  const rideBuddiesQuery =
    uniqueRideIds.length > 0
      ? await db
          .select({
            odl: schema.user.id,
            name: schema.user.name,
            image: schema.user.image,
            count: count(),
          })
          .from(schema.rideMember)
          .innerJoin(schema.user, eq(schema.rideMember.userId, schema.user.id))
          .where(
            and(
              inArray(schema.rideMember.rideId, uniqueRideIds),
              sql`${schema.rideMember.userId} != ${userId}`,
            ),
          )
          .groupBy(schema.user.id, schema.user.name, schema.user.image)
          .orderBy(desc(count()))
          .limit(5)
      : [];

  // Also include ride leaders as buddies (excluding unclaimed rides)
  const leaderBuddiesQuery =
    uniqueRideIds.length > 0
      ? await db
          .select({
            odl: schema.ride.userId,
            name: schema.user.name,
            image: schema.user.image,
            count: count(),
          })
          .from(schema.ride)
          .innerJoin(schema.user, eq(schema.ride.userId, schema.user.id))
          .where(
            and(
              inArray(schema.ride.id, uniqueRideIds),
              sql`${schema.ride.userId} != ${userId}`,
              eq(schema.ride.unclaimed, false),
            ),
          )
          .groupBy(schema.ride.userId, schema.user.name, schema.user.image)
          .orderBy(desc(count()))
      : [];

  // Merge buddy lists
  const buddyMap = new Map<string, { name: string; image: string | null; count: number }>();
  for (const buddy of rideBuddiesQuery) {
    buddyMap.set(buddy.odl, {
      name: buddy.name,
      image: buddy.image,
      count: buddy.count,
    });
  }
  for (const leader of leaderBuddiesQuery) {
    const existing = buddyMap.get(leader.odl);
    if (existing) {
      existing.count += leader.count;
    } else {
      buddyMap.set(leader.odl, {
        name: leader.name,
        image: leader.image,
        count: leader.count,
      });
    }
  }
  const topRidingBuddies = Array.from(buddyMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Favourite leader - whose rides did the user join most? (excluding unclaimed rides)
  const joinedRideIds = ridesJoinedData.map((r) => r.ride.id);
  const leaderCounts =
    joinedRideIds.length > 0
      ? await db
          .select({
            odl: schema.ride.userId,
            name: schema.user.name,
            image: schema.user.image,
            count: count(),
          })
          .from(schema.ride)
          .innerJoin(schema.user, eq(schema.ride.userId, schema.user.id))
          .where(
            and(
              inArray(schema.ride.id, joinedRideIds),
              sql`${schema.ride.userId} != ${userId}`,
              eq(schema.ride.unclaimed, false),
            ),
          )
          .groupBy(schema.ride.userId, schema.user.name, schema.user.image)
          .orderBy(desc(count()))
          .limit(1)
      : [];

  const topLeader = leaderCounts[0];
  const favouriteLeader = topLeader
    ? {
        name: topLeader.name,
        image: topLeader.image,
        count: topLeader.count,
      }
    : null;

  // Surface breakdown
  const surfaceBreakdown = {
    road: uniqueRides.filter((r) => r.surface === "road").length,
    offroad: uniqueRides.filter((r) => r.surface === "offroad").length,
    virtual: uniqueRides.filter((r) => r.surface === "virtual").length,
  };

  // Monthly activity
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthlyActivity = monthNames.map((month, index) => ({
    month,
    rides: uniqueRides.filter((r) => r.date.getMonth() === index).length,
  }));

  const mostActiveMonth = monthlyActivity.reduce(
    (best, m) => (m.rides > (best?.rides || 0) ? m : best),
    null as { month: string; rides: number } | null,
  );

  // Rank among all club members by ride count
  const allMemberRideCounts = await db
    .select({
      odl: schema.rideMember.userId,
      count: count(),
    })
    .from(schema.rideMember)
    .innerJoin(schema.ride, eq(schema.rideMember.rideId, schema.ride.id))
    .where(validRideConditions)
    .groupBy(schema.rideMember.userId);

  // Also count rides led (excluding unclaimed)
  const allLeaderRideCounts = await db
    .select({
      odl: schema.ride.userId,
      count: count(),
    })
    .from(schema.ride)
    .where(and(validRideConditions, eq(schema.ride.unclaimed, false)))
    .groupBy(schema.ride.userId);

  // Merge counts
  const totalRideCountMap = new Map<string, number>();
  for (const m of allMemberRideCounts) {
    totalRideCountMap.set(m.odl, (totalRideCountMap.get(m.odl) || 0) + m.count);
  }
  for (const l of allLeaderRideCounts) {
    totalRideCountMap.set(l.odl, (totalRideCountMap.get(l.odl) || 0) + l.count);
  }

  const sortedRiders = Array.from(totalRideCountMap.entries()).sort((a, b) => b[1] - a[1]);
  const userPosition = sortedRiders.findIndex(([id]) => id === userId) + 1;
  const totalRiders = sortedRiders.length;
  const percentile =
    totalRiders > 0 ? Math.max(1, Math.round((1 - (userPosition - 1) / totalRiders) * 100)) : 100;

  return {
    user: {
      name: user.name,
      image: user.image,
    },
    ridesJoined,
    ridesLed,
    totalKm,
    totalElevation,
    longestRide: longestRide
      ? {
          name: longestRide.name,
          distance: longestRide.distance,
          date: longestRide.date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
          }),
        }
      : null,
    biggestGroup,
    favouriteRoute,
    favouriteCafe,
    topRidingBuddies,
    favouriteLeader,
    surfaceBreakdown,
    monthlyActivity,
    mostActiveMonth: mostActiveMonth?.rides ? mostActiveMonth : null,
    rank: {
      position: userPosition || totalRiders + 1,
      total: totalRiders,
      percentile,
    },
  };
}
