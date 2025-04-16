import { H2 } from "@/components/ui/typography";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { UpsertForm } from "../form";

export default async function UpsertRidePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getMembership();
  const { slug } = await params;

  const ride = await db.query.ride.findFirst({
    where: and(eq(schema.ride.slug, slug), eq(schema.ride.userId, user.id)),
  });
  if (!ride) {
    return notFound();
  }

  return (
    <main className="flex max-w-2xl flex-col gap-4">
      <H2>Edit ride</H2>
      <UpsertForm ride={ride} />
    </main>
  );
}
