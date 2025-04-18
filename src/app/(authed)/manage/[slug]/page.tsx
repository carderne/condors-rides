import { H2, H3 } from "@/components/ui/typography";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { UpsertForm } from "../form";

export default async function UpsertRidePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getMembership();
  const { slug } = await params;

  const ride = await db.query.ride.findFirst({
    where: and(eq(schema.ride.slug, slug), isNull(schema.ride.deletedAt)),
  });

  if (!ride) {
    return notFound();
  }
  // admins can edit any ride
  if (ride.userId !== user.id && user.type !== "admin") {
    return notFound();
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <H2>Edit ride</H2>
        {ride.userId !== user.id && <H3 className="text-primary">Editing as admin</H3>}
      </div>
      <UpsertForm ride={ride} />
    </main>
  );
}
