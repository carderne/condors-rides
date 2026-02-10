import type { Ride, RideMember, User } from "@/db/zod";
import { formatRideName, formatStartPoint } from "@/lib/fmt";
import { rideIsFull } from "@/lib/permissions";
import { surfaceStyle } from "@/lib/surface";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  ClockIcon,
  ExternalLinkIcon,
  LandPlotIcon,
  MapPinIcon,
  MountainIcon,
  UsersIcon,
  WindIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { H3 } from "../ui/typography";
import { UserAvatar } from "../user";

export type RideHydrated = Ride & { leader: User; members: RideMember[] };

export function RideCard({ ride, user }: { ride: RideHydrated; user: User | null }) {
  const showLeader = !!user;
  const href = `/rides/${ride.slug}`;
  const isCanceled = !!ride.canceledAt;
  const isFull = rideIsFull(ride);

  const style = surfaceStyle(ride.surface);

  return (
    <div className="group h-full">
      <div
        className={cn(
          "flex h-full flex-col gap-2 overflow-hidden rounded-xl border-2 bg-stone-50 shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl",
          style.border,
        )}
      >
        {/* Time and offroad */}
        <div className="flex justify-between">
          <div className="flex items-center gap-2 rounded-br-xl border-r-2 border-b-2 border-pink-200 bg-white p-2">
            <ClockIcon className="h-3 w-3 text-pink-500" />
            <span className="font-bold text-gray-700">{ride.time.slice(0, 5)}</span>
          </div>
          <div className={cn("p-2 text-xl font-bold italic", style.text)}>{style.label}</div>
        </div>

        {/* Everything else */}
        <div className="flex h-full flex-col justify-between gap-4 p-4 pt-0">
          <div className="flex flex-col gap-4">
            {/* Title and Leader */}
            <Link href={href} className="flex flex-col gap-2">
              <span className="transition-colors group-hover:text-pink-600">
                <H3 className={cn(ride.canceledAt ? "line-through" : "")}>
                  {formatRideName(ride.name)}
                </H3>
                {isCanceled ? <span /> : isFull ? <span className="text-sm">(FULL)</span> : null}
              </span>
              {showLeader && (
                <div className="flex items-center gap-3">
                  <UserAvatar user={ride.unclaimed ? null : ride.leader} className="size-10" />
                  <span className="text-gray-600">
                    {ride.unclaimed ? "No leader!" : ride.leader.name}
                  </span>
                </div>
              )}
            </Link>

            {/* Stats */}
            <RideStats ride={ride} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button asChild className="h-full">
              <Link
                href={href}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-white shadow-md transition-all hover:shadow-lg",
                  style.button,
                )}
              >
                Details
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>

            {ride.routeUrl && (
              <Link
                href={ride.routeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-pink-200 bg-white px-4 py-3 font-medium text-pink-600 transition-colors hover:bg-pink-50"
              >
                Route
                <ExternalLinkIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RideStats({ ride }: { ride: RideHydrated }) {
  const numRiders = ride.members.length + (ride.unclaimed ? 0 : 1);
  if (ride.canceledAt) {
    return null;
  }
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center gap-3 rounded-xl bg-gray-50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100">
          <WindIcon className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <div className="text-xs tracking-wide text-gray-500 uppercase">Speed</div>
          <div className="font-semibold">{ride.speed} kph</div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-gray-50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100">
          <MapPinIcon className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <div className="text-xs tracking-wide text-gray-500 uppercase">Distance</div>
          <div className="font-semibold">{ride.distance} km</div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-gray-50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100">
          <UsersIcon className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <div className="text-xs tracking-wide text-gray-500 uppercase">Riders</div>
          <div className="font-semibold">{numRiders}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-gray-50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100">
          <LandPlotIcon className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <div className="text-xs tracking-wide text-gray-500 uppercase">Start</div>
          <div className="text-primary text-sm font-semibold">
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ride.startPoint)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {formatStartPoint(ride.startPoint)}
            </Link>
          </div>
        </div>
      </div>

      {ride.elevation !== null && (
        <div className="flex items-center gap-3 rounded-xl bg-gray-50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100">
            <MountainIcon className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <div className="text-xs tracking-wide text-gray-500 uppercase">Elevation</div>
            <div className="font-semibold">{ride.elevation} m</div>
          </div>
        </div>
      )}
    </div>
  );
}
