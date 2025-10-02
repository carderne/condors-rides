import { type DatedRide, RideList } from "@/components/rides/list";
import { TabSwitcher, type TabVal } from "@/components/rides/tabs";
import { SurveyForm } from "@/components/survey/form";
import { H3 } from "@/components/ui/typography";
import type { Survey, User } from "@/db/zod";
import { Container } from "../container";
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
  surveys,
  showArchive = false,
}: {
  rides: DatedRide[];
  user: User | null;
  surveys?: Survey[];
  showArchive?: boolean;
}) {
  return (
    <Container className="pt-0">
      <TabSwitcher prefix="rides" tabs={TABS} />
      {surveys?.map((survey) => (
        <SurveyForm key={survey.id} survey={survey} />
      ))}
      {rides.length === 0 ? (
        <div className="mx-auto mt-20">
          <H3>No rides :(</H3>
        </div>
      ) : (
        <RideList datedRideArray={rides} user={user} />
      )}
      {showArchive && (
        <div className="flex justify-end">
          <ShowMoreButton />
        </div>
      )}
    </Container>
  );
}
