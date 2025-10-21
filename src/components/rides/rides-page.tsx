import { Container } from "@/components/container";
import { NotificationPrompt } from "@/components/notifications/notifications";
import { type DatedRide, RideList } from "@/components/rides/list";
import { TabSwitcher, type TabVal } from "@/components/rides/tabs";
import { H3 } from "@/components/ui/typography";
import type { User } from "@/db/zod";
import { AccessMessage } from "../access-message";
import { ShowMoreButton } from "./show-more";

const TABS: TabVal[] = [
  { path: "recent", color: "pink" },
  { path: "upcoming", color: "pink" },
  { path: "future", color: "pink" },
  { path: "joined", color: "green" },
];

export function GenericRidesPage({
  rides,
  user,
  blockAccess = false,
  showArchive = false,
}: {
  rides: DatedRide[];
  user: User | null;
  blockAccess?: boolean;
  showArchive?: boolean;
}) {
  return (
    <Container className="pt-0">
      <TabSwitcher prefix="rides" tabs={TABS} />
      <NotificationPrompt />
      {blockAccess ? (
        <div className="mx-auto mt-20">
          <AccessMessage />
        </div>
      ) : rides.length === 0 ? (
        <div className="mx-auto mt-20">
          <H3>No rides :(</H3>
        </div>
      ) : (
        <RideList datedRideArray={rides} user={user} />
      )}
      {showArchive && !blockAccess && (
        <div className="flex justify-end">
          <ShowMoreButton />
        </div>
      )}
    </Container>
  );
}
