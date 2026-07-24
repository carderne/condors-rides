import { db, schema } from "@/db";
import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import slugify from "slugify";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const ride = await db.query.ride.findFirst({
    columns: { name: true },
    where: and(eq(schema.ride.slug, slug), isNull(schema.ride.deletedAt)),
    with: { route: { columns: { gpx: true } } },
  });

  if (!ride?.route?.gpx) {
    return notFound();
  }

  const filename = `${slugify(ride.name, { lower: true, strict: true })}.gpx`;

  return new Response(ride.route.gpx, {
    headers: {
      "Content-Type": "application/gpx+xml",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
