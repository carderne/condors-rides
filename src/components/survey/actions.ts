"use server";

import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function action(surveyId: string, option: string) {
  const user = await getMembership();

  const insertable = { selectedOptions: [option] };

  await db
    .insert(schema.surveyResponse)
    .values({
      surveyId,
      userId: user.id,
      ...insertable,
    })
    .onConflictDoUpdate({
      target: [schema.surveyResponse.surveyId, schema.surveyResponse.userId],
      set: insertable,
    });

  revalidatePath("/");
}

export async function undoAction(surveyId: string) {
  const user = await getMembership();

  await db
    .delete(schema.surveyResponse)
    .where(
      and(eq(schema.surveyResponse.surveyId, surveyId), eq(schema.surveyResponse.userId, user.id)),
    );

  revalidatePath("/");
}
