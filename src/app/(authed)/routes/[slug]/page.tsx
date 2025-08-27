import { H2 } from "@/components/ui/typography";
import { getSuperUser } from "@/dal/membership";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { UpsertForm } from "./form";

export default async function UpsertRoutePage({ params }: { params: Promise<{ slug: string }> }) {
  await getSuperUser();
  const { slug } = await params;

  const route = await db.query.route.findFirst({
    where: eq(schema.route.id, slug),
  });

  if (!route) {
    return notFound();
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <H2>Edit route</H2>
      </div>
      <UpsertForm route={route} />
    </main>
  );
}
