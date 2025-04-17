import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Ride, User } from "@/db/zod";
import { formatFullDate, formatTime } from "@/lib/fmt";
import { ArrowRightIcon, CalendarDaysIcon, ClockIcon, GaugeIcon, RulerIcon } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "../user";

type RideHydrated = Ride & { leader: User };

export function RideCard({ ride }: { ride: RideHydrated }) {
  return (
    <Link href={`/rides/${ride.slug}`} className="block h-full">
      <Card className="hover:border-primary flex h-full w-full cursor-pointer flex-col border transition-all hover:-translate-y-1 hover:shadow-md">
        <CardHeader className="from-primary to-primary-hover bg-gradient-to-r text-white">
          <CardTitle className="truncate text-xl">{ride.name}</CardTitle>
          <div className="mt-2 flex items-center gap-2">
            <UserAvatar user={ride.unclaimed ? null : ride.leader} />
            <span className="truncate text-sm font-medium">
              {ride.unclaimed ? "No leader! Can you lead it?" : ride.leader.name}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CalendarDaysIcon className="text-primary h-5 w-5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div className="text-sm">{formatFullDate(ride.date)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ClockIcon className="text-primary h-5 w-5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">Time</div>
                <div className="text-sm">{formatTime(ride.time)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <GaugeIcon className="text-primary h-5 w-5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">Speed</div>
                <div className="text-sm font-medium">{ride.speed} kph</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RulerIcon className="text-primary h-5 w-5 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">Distance</div>
                <div className="text-sm font-medium">{ride.distance} km</div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="mt-auto border-t bg-slate-50 pt-3 pb-4">
          <div className="flex w-full justify-end">
            <div className="text-primary hover:text-primary-hover flex items-center gap-1 text-sm font-medium transition-colors">
              View details
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
