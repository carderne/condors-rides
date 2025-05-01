import { type DatedRide, RideList } from "@/components/rides/list";
import { RidesTabSwitcher } from "@/components/rides/tabs";
import { H3 } from "@/components/ui/typography";
import type { User } from "@/db/zod";

export function GenericRidesPage({ rides, user }: { rides: DatedRide[]; user: User | null }) {
  return (
    <main className="flex min-h-full flex-col gap-4">
      <RidesTabSwitcher />
      {rides.length === 0 ? (
        <div className="mx-auto mt-20">
          <H3>No rides :(</H3>
        </div>
      ) : (
        <RideList datedRideArray={rides} user={user} />
      )}
    </main>
  );
}
