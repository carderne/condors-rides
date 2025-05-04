import type { RideHydrated } from "@/components/rides/card";
import type { User } from "@/db/zod";

export function checkIsAdmin(user: User): boolean {
  return user.type === "admin";
}

export function rideIsFull(ride: RideHydrated): boolean {
  if (!ride.maxGroupSize) {
    return false;
  }
  const leaderCount = ride.unclaimed ? 0 : 1;
  const numRiders = leaderCount + ride.members.length;
  const isFull = numRiders >= ride.maxGroupSize;
  return isFull;
}
