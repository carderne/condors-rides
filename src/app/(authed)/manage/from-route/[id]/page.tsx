import { H2 } from "@/components/ui/typography";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { UpsertForm } from "../../form";

export default async function NewRideFromRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const route = await db.query.route.findFirst({
    where: eq(schema.route.id, id),
  });
  if (!route) {
    return notFound();
  }

  const { name, url: routeUrl, distance, elevation, cafeStop } = route;
  const routeOnly = { name, routeUrl, distance, elevation, cafeStop };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4">
      <H2>New ride</H2>
      <UpsertForm ride={routeOnly} />
    </main>
  );
}
