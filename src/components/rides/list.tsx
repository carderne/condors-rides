import { RideCard, type RideHydrated } from "@/components/rides/card";
import type { User } from "@/db/zod";
import { formatISODate } from "@/lib/fmt";
import { format, getDate } from "date-fns";

export interface DatedRide {
  date: Date;
  rides: RideHydrated[];
}

export function groupRidesByDate(rides: RideHydrated[]): DatedRide[] {
  const groupedByDate = rides.reduce<Record<string, RideHydrated[]>>((grouped, ride) => {
    const dateKey = formatISODate(ride.date);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(ride);
    return grouped;
  }, {});

  const datedArray = Object.entries(groupedByDate).map(([dateStr, rides]) => ({
    date: new Date(dateStr),
    rides,
  }));
  return datedArray;
}

export function RideList({
  datedRideArray,
  user,
}: {
  datedRideArray: DatedRide[];
  user: User | null;
}) {
  return (
    <main className="flex min-h-full flex-col gap-16">
      {datedRideArray.map((dateGroup) => (
        <div key={formatISODate(dateGroup.date)} className="relative flex flex-col gap-4">
          {/* Creative Date Header */}
          <div className="sticky top-2 z-20 py-2">
            {/* Decorative line */}
            <div className="absolute top-1/2 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>

            {/* Date pill */}
            <div className="relative mx-auto flex w-fit overflow-hidden rounded-xl border-2 border-pink-200 bg-white shadow-xl">
              {/* Left date box */}
              <div className="flex min-w-[90px] flex-col items-center justify-center bg-gradient-to-br from-pink-500 to-pink-600 p-2 text-white">
                <span className="text-xl font-bold">{getDate(dateGroup.date)}</span>
                <span className="text-xs tracking-wider uppercase">
                  {format(dateGroup.date, "MMM")}
                </span>
              </div>

              {/* Right weekday box */}
              <div className="flex items-center px-6">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-800">
                    {format(dateGroup.date, "EEEE")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rides Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {dateGroup.rides.map((ride) => (
              <div key={ride.id} className="h-full">
                <RideCard ride={ride} user={user} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
