import { H2 } from "@/components/ui/typography";
import { UpsertForm } from "../form";

export default async function NewRidePage() {
  return (
    <main className="flex max-w-2xl flex-col gap-4">
      <H2>New ride</H2>
      <UpsertForm ride={undefined} />
    </main>
  );
}
