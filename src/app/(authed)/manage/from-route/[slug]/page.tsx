import { H2 } from "@/components/ui/typography";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { UpsertForm } from "../../form";

export default async function NewRideFromRoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const ride = await db.query.ride.findFirst({
    where: eq(schema.ride.slug, slug),
  });
  if (!ride) {
    return notFound();
  }

  const { name, route, distance, elevation, cafeStop } = ride;
  const routeOnly = { name, route, distance, elevation, cafeStop };

  return (
    <main className="flex max-w-2xl flex-col gap-4">
      <H2>New ride</H2>
      <UpsertForm ride={routeOnly} />
    </main>
  );
}
