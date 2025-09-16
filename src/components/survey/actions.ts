"use server";

import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type State, validator } from "./validate";

export async function action(surveyId: string, _: State, formData: FormData): Promise<State> {
  const user = await getMembership();

  const validated = validator(formData);
  if (validated.errors) return validated;
  const { data } = validated;

  const insertable = { selectedOptions: data.options, comment: data.comment };

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
  return { errors: {} };
}

export async function undoAction(surveyId: string): Promise<State> {
  const user = await getMembership();

  await db
    .delete(schema.surveyResponse)
    .where(
      and(eq(schema.surveyResponse.surveyId, surveyId), eq(schema.surveyResponse.userId, user.id)),
    );

  revalidatePath("/");
  return { errors: {} };
}
