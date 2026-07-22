import { db, schema } from "@/db";
import { and, eq, isNull } from "drizzle-orm";

export async function getRidePreview(slug: string) {
  return db.query.ride.findFirst({
    where: and(eq(schema.ride.slug, slug), isNull(schema.ride.deletedAt)),
    with: {
      route: true,
      leader: true,
    },
  });
}

export type RidePreview = NonNullable<Awaited<ReturnType<typeof getRidePreview>>>;
