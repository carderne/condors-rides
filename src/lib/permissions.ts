import type { RideHydrated } from "@/components/rides/card";
import type { User } from "@/db/zod";
import { isAfter, subYears } from "date-fns";

export function checkIsAdmin(user: User): boolean {
  return user.type === "admin";
}

export function checkIsSuper(user: User): boolean {
  return user.type === "admin" || user.type === "super";
}

export function rideIsFull(ride: RideHydrated): boolean {
  if (ride.maxGroupSize === null) {
    return false;
  }
  const leaderCount = ride.unclaimed ? 0 : 1;
  const numRiders = leaderCount + ride.members.length;
  const isFull = numRiders >= ride.maxGroupSize;
  return isFull;
}

export function isVerified(user: User): boolean {
  const { verifiedAt } = user;
  if (verifiedAt === null) {
    return false;
  }
  const verified = isAfter(verifiedAt, subYears(new Date(), 1));
  return verified;
}
