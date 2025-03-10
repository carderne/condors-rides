import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import slugify from "slugify";
import { formatISODate } from "./fmt";

export async function createSlug(date: Date, name: string): Promise<string> {
  const d = formatISODate(date);
  const withDate = `${d}-${name}`;
  const res = await createSlugInner(withDate);
  return res;
}

async function createSlugInner(name: string): Promise<string> {
  const slug = slugify(name, { lower: true, strict: true });

  const existingSlugs = await db
    .select({ id: schema.ride.id })
    .from(schema.ride)
    .where(eq(schema.ride.slug, slug));

  if (existingSlugs.length === 0) {
    return slug;
  }

  const newSlug = `${slug}-${nanoid(4)}`;
  return createSlugInner(newSlug);
}
