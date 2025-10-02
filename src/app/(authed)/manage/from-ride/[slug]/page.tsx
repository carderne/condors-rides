import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { UpsertForm } from "../../form";

export default async function NewRideFromRidePage({
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

  const {
    name,
    time,
    speed,
    surface,
    startPoint,
    routeUrl,
    distance,
    elevation,
    cafeStop,
    maxGroupSize,
    notes,
  } = ride;
  const detailsOnly = {
    name,
    time,
    speed,
    surface,
    startPoint,
    routeUrl,
    distance,
    elevation,
    cafeStop,
    maxGroupSize,
    notes,
  };

  return <UpsertForm ride={detailsOnly} />;
}
