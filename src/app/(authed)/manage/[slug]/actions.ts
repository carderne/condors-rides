"use server";

import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { invariant } from "@/lib/invariant";
import { createSlug } from "@/lib/slug";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { type State, validator } from "./validate";

export async function action(
  existingRideId: string | undefined,
  _: State,
  formData: FormData,
): Promise<State> {
  const user = await getMembership();

  const validated = validator(formData);
  if (validated.errors) return validated;
  const { data } = validated;

  const slug = existingRideId ? undefined : await createSlug(data.date, data.name);
  const insertable = { ...data, userId: user.id };

  const [ride] = await db
    .insert(schema.ride)
    .values({ id: existingRideId, slug, ...insertable })
    .onConflictDoUpdate({
      target: schema.ride.id,
      set: insertable,
    })
    .returning();
  invariant(ride, "no ride upserted");

  redirect(`/rides/${slug}`);
}

export async function deleteAction(rideId: string) {
  const user = await getMembership();
  await db
    .delete(schema.ride)
    .where(and(eq(schema.ride.id, rideId), eq(schema.ride.userId, user.id)));
}
