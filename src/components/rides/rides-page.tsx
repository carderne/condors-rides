import { type DatedRide, RideList } from "@/components/rides/list";
import { RidesTabSwitcher } from "@/components/rides/tabs";
import { SurveyForm } from "@/components/survey/form";
import { H3 } from "@/components/ui/typography";
import type { Survey, User } from "@/db/zod";

export function GenericRidesPage({
  rides,
  user,
  surveys,
}: {
  rides: DatedRide[];
  user: User | null;
  surveys?: Survey[];
}) {
  return (
    <main className="flex min-h-full flex-col gap-4">
      <RidesTabSwitcher />
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
    </main>
  );
}
