"use server";

import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function agreePrivacy() {
  const user = await getMembership();

  await db
    .update(schema.user)
    .set({
      agreedAt: new Date(),
    })
    .where(eq(schema.user.id, user.id));

  revalidatePath("/rides/upcoming");
}
