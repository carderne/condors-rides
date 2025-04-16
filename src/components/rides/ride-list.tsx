import type { Ride, User } from "@/db/zod";
import { formatShortDate } from "@/lib/fmt";
import { invariant } from "@/lib/invariant";
import { RideCard } from "./ride-card";

type RideHydrated = Ride & { leader: User };
interface GroupedRides {
  date: Date;
  rides: RideHydrated[];
}

export function RideList({ rides }: { rides: RideHydrated[] }) {
  const groupedRides = groupRidesByDate(rides);

  return (
    <div className="flex flex-col py-8">
      {rides.length > 0 ? (
        groupedRides.map(({ date, rides }) => (
          <div key={date.toISOString()}>
            <div className="text-primary text-2xl font-bold">{formatShortDate(date)}</div>
            <div className="flex flex-row flex-wrap">
              {rides.map((ride) => (
                <div key={ride.id} className="basis-full p-3 md:basis-1/3">
                  <RideCard ride={ride} />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="basis-full rounded-lg border border-dashed bg-slate-50 py-12 text-center md:basis-1/3">
          <p className="text-lg text-slate-600">No rides scheduled yet!</p>
          <p className="mt-2 text-sm text-slate-500">Create a new ride to get started</p>
        </div>
      )}
    </div>
  );
}

function groupRidesByDate(rides: RideHydrated[]): GroupedRides[] {
  const groupedMap = rides.reduce((acc, ride) => {
    const date = new Date(ride.date);
    date.setHours(0, 0, 0, 0);
    const [dateStr] = date.toISOString().split("T");
    invariant(dateStr);
    if (!acc.has(dateStr)) {
      acc.set(dateStr, { date: date, rides: [] });
    }
    acc.get(dateStr)!.rides.push(ride);
    return acc;
  }, new Map<string, GroupedRides>());
  return Array.from(groupedMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}
