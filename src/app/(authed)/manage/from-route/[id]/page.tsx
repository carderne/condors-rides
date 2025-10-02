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

  return <UpsertForm ride={routeOnly} />;
}
