"use server";

import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { type State, validator } from "./validate";

export async function action(_: State, formData: FormData): Promise<State> {
  const user = await getMembership();

  const validated = validator(formData);
  if (validated.errors) return validated;
  const { data } = validated;

  await db.update(schema.user).set(data).where(eq(schema.user.id, user.id));

  redirect("/settings");
}
