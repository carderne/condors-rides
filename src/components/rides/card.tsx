import type { Ride, RideMember, User } from "@/db/zod";
import {
  ArrowRightIcon,
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  MountainIcon,
  UsersIcon,
  WindIcon,
} from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "../user";

export type RideHydrated = Ride & { leader: User; members: RideMember[] };

export function RideCard({ ride }: { ride: RideHydrated }) {
  const href = `/rides/${ride.slug}`;
  return (
    <div className="group">
      <div className="overflow-hidden rounded-2xl bg-stone-50 shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl">
        {/* Content */}
        <div className="relative p-6">
          <div className="mb-4 flex items-center justify-between">
            {/* Time Pill */}
            <div className="rounded-full border-2 border-pink-200 bg-white px-4 py-1 shadow-lg">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-3 w-3 text-pink-500" />
                <span className="font-bold text-gray-700">{ride.time.slice(0, 5)}</span>
              </div>
            </div>
            {/* Surface Badge */}
            {ride.surface === "gravel" && (
              <div className="text-xl font-bold text-amber-800 italic">Gravel</div>
            )}
          </div>
          {/* Title and Leader */}
          <Link href={href}>
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-gray-800 transition-colors group-hover:text-pink-600">
                {ride.name}
              </h2>
              <div className="flex items-center gap-3">
                <UserAvatar user={ride.unclaimed ? null : ride.leader} />
                <span className="text-gray-600">
                  {ride.unclaimed ? "No leader!" : ride.leader.name}
                </span>
              </div>
            </div>
          </Link>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                <WindIcon className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <div className="text-xs tracking-wide text-gray-500 uppercase">Speed</div>
                <div className="font-semibold">{ride.speed} kph</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                <MapPinIcon className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <div className="text-xs tracking-wide text-gray-500 uppercase">Distance</div>
                <div className="font-semibold">{ride.distance} km</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                <UsersIcon className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <div className="text-xs tracking-wide text-gray-500 uppercase">Riders</div>
                <div className="font-semibold">{ride.members.length}</div>
              </div>
            </div>

            {ride.elevation && (
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
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

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <Link
              href={href}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-3 font-medium text-white shadow-md transition-all hover:from-pink-600 hover:to-pink-700 hover:shadow-lg"
            >
              View details
              <ArrowRightIcon className="h-4 w-4" />
            </Link>

            {ride.route && (
              <Link
                href={ride.route}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-pink-200 bg-white px-4 py-3 font-medium text-pink-600 transition-colors hover:bg-pink-50"
              >
                View route
                <ExternalLinkIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
