import {
  ChristmasTree,
  FallingSnowflakes,
  Snowflake,
  TwinklingLights,
} from "@/components/christmas";
import type { Ride, RideMember, User } from "@/db/zod";
import { formatRideName, formatStartPoint } from "@/lib/fmt";
import { rideIsFull } from "@/lib/permissions";
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
  const isChristmasEvent = ride.surface === "event";

  // Christmas event card
  if (isChristmasEvent) {
    return (
      <div className="group h-full">
        <div
          className="relative flex h-full flex-col gap-2 overflow-hidden rounded-xl border-4 shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl"
          style={{
            borderImage:
              "linear-gradient(135deg, #c41e3a 0%, #228b22 25%, #c41e3a 50%, #228b22 75%, #c41e3a 100%) 1",
            background: "linear-gradient(180deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%)",
          }}
        >
          {/* Twinkling lights at the top */}
          <TwinklingLights />

          {/* Falling snowflakes */}
          <FallingSnowflakes />

          {/* Corner decorations */}
          <div className="pointer-events-none absolute top-8 left-2 z-10">
            <ChristmasTree className="h-8 w-8 text-green-400 drop-shadow-lg" />
          </div>
          <div className="pointer-events-none absolute top-8 right-2 z-10">
            <ChristmasTree className="h-8 w-8 text-green-400 drop-shadow-lg" />
          </div>
          <div className="pointer-events-none absolute bottom-2 left-2 z-10">
            <Snowflake className="h-6 w-6 text-white/70" />
          </div>
          <div className="pointer-events-none absolute right-2 bottom-2 z-10">
            <Snowflake className="h-6 w-6 text-white/70" />
          </div>

          {/* Time and Event badge */}
          <div className="relative z-20 flex justify-between pt-6">
            <div className="flex items-center gap-2 rounded-br-xl border-r-2 border-b-2 border-red-400/50 bg-white/90 p-2 backdrop-blur-sm">
              <ClockIcon className="h-3 w-3 text-red-600" />
              <span className="font-bold text-gray-700">{ride.time.slice(0, 5)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-20 flex h-full flex-col justify-between gap-4 p-4 pt-0">
            <div className="flex flex-col gap-4">
              {/* Title and Leader */}
              <Link href={href} className="flex flex-col gap-2">
                <span className="transition-colors group-hover:text-yellow-300">
                  <H3
                    className={cn(
                      "text-white drop-shadow-lg",
                      ride.canceledAt ? "line-through" : "",
                    )}
                  >
                    {formatRideName(ride.name)}
                  </H3>
                  {isCanceled ? (
                    <span />
                  ) : isFull ? (
                    <span className="text-sm text-yellow-300">(FULL)</span>
                  ) : null}
                </span>
                {showLeader && (
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      user={ride.unclaimed ? null : ride.leader}
                      className="size-10 ring-2 ring-yellow-400"
                    />
                    <span className="text-white/90">
                      {ride.unclaimed ? "No leader!" : ride.leader.name}
                    </span>
                  </div>
                )}
              </Link>

              {/* Stats with Christmas colors */}
              <ChristmasRideStats ride={ride} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button asChild className="h-full">
                <Link
                  href={href}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-green-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:from-red-700 hover:via-red-600 hover:to-green-700 hover:shadow-xl"
                  style={{
                    boxShadow: "0 0 15px rgba(255,0,0,0.3), 0 0 15px rgba(0,255,0,0.3)",
                  }}
                >
                  <span className="mr-1">🎁</span>
                  Details
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>

              {ride.routeUrl && (
                <Link
                  href={ride.routeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-yellow-400/50 bg-white/90 px-4 py-3 font-medium text-green-700 backdrop-blur-sm transition-colors hover:bg-yellow-50"
                >
                  Route
                  <ExternalLinkIcon className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Bottom garland decoration */}
          <div className="absolute right-0 bottom-0 left-0 h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="group h-full">
      <div
        className={cn(
          "flex h-full flex-col gap-2 overflow-hidden rounded-xl border-2 bg-stone-50 shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl",
          "border-primary",
          ride.surface === "offroad" && "border-amber-800",
          ride.surface === "virtual" && "border-purple-800",
        )}
      >
        {/* Time and offroad */}
        <div className="flex justify-between">
          <div className="flex items-center gap-2 rounded-br-xl border-r-2 border-b-2 border-pink-200 bg-white p-2">
            <ClockIcon className="h-3 w-3 text-pink-500" />
            <span className="font-bold text-gray-700">{ride.time.slice(0, 5)}</span>
          </div>
          {ride.surface === "offroad" && (
            <div className="p-2 text-xl font-bold text-amber-800 italic">Offroad</div>
          )}
          {ride.surface === "virtual" && (
            <div className="p-2 text-xl font-bold text-purple-800 italic">Virtual</div>
          )}
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
                  "flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-3 font-medium text-white shadow-md transition-all hover:from-pink-600 hover:to-pink-700 hover:shadow-lg",
                  ride.surface === "offroad" ? "bg-amber-800 hover:bg-amber-900" : "",
                  ride.surface === "virtual" ? "bg-purple-800 hover:bg-purple-900" : "",
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
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
          <WindIcon className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <div className="text-xs tracking-wide text-gray-500 uppercase">Speed</div>
          <div className="font-semibold">{ride.speed} kph</div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-gray-50">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
          <MapPinIcon className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <div className="text-xs tracking-wide text-gray-500 uppercase">Distance</div>
          <div className="font-semibold">{ride.distance} km</div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-gray-50">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
          <UsersIcon className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <div className="text-xs tracking-wide text-gray-500 uppercase">Riders</div>
          <div className="font-semibold">{numRiders}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-gray-50">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
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
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
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

// Christmas-themed stats with festive colors
function ChristmasRideStats({ ride }: { ride: RideHydrated }) {
  const numRiders = ride.members.length + (ride.unclaimed ? 0 : 1);
  if (ride.canceledAt) {
    return null;
  }

  // Alternate between red and green for icons
  const red = { bg: "bg-red-100", icon: "text-red-600" };
  const green = { bg: "bg-green-100", icon: "text-green-600" };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center gap-3 rounded-xl bg-white/20 p-2 backdrop-blur-sm">
        <div
          className={cn(
            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
            red.bg,
          )}
        >
          <WindIcon className={cn("h-4 w-4", red.icon)} />
        </div>
        <div>
          <div className="text-xs tracking-wide text-white/70 uppercase">Speed</div>
          <div className="font-semibold text-white">{ride.speed} kph</div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-white/20 p-2 backdrop-blur-sm">
        <div
          className={cn(
            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
            green.bg,
          )}
        >
          <MapPinIcon className={cn("h-4 w-4", green.icon)} />
        </div>
        <div>
          <div className="text-xs tracking-wide text-white/70 uppercase">Distance</div>
          <div className="font-semibold text-white">{ride.distance} km</div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-white/20 p-2 backdrop-blur-sm">
        <div
          className={cn(
            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
            red.bg,
          )}
        >
          <UsersIcon className={cn("h-4 w-4", red.icon)} />
        </div>
        <div>
          <div className="text-xs tracking-wide text-white/70 uppercase">Riders</div>
          <div className="font-semibold text-white">{numRiders}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-white/20 p-2 backdrop-blur-sm">
        <div
          className={cn(
            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
            green.bg,
          )}
        >
          <LandPlotIcon className={cn("h-4 w-4", green.icon)} />
        </div>
        <div>
          <div className="text-xs tracking-wide text-white/70 uppercase">Start</div>
          <div className="text-sm font-semibold text-yellow-300">
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
        <div className="flex items-center gap-3 rounded-xl bg-white/20 p-2 backdrop-blur-sm">
          <div
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
              red.bg,
            )}
          >
            <MountainIcon className={cn("h-4 w-4", red.icon)} />
          </div>
          <div>
            <div className="text-xs tracking-wide text-white/70 uppercase">Elevation</div>
            <div className="font-semibold text-white">{ride.elevation} m</div>
          </div>
        </div>
      )}
    </div>
  );
}
