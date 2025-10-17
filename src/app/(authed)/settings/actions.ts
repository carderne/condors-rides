"use server";

import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import { invariant } from "@/lib/invariant";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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

export async function deleteAccountAction() {
  const user = await getMembership();

  const where = eq(schema.user.id, user.id);
  const accountToDelete = await db.query.user.findFirst({ where });
  invariant(accountToDelete);
  const name = `${accountToDelete.name} [DELETED]`;

  await db.transaction(async (tx) => {
    await tx.update(schema.user).set({ name, deactivatedAt: new Date() }).where(where);
    await tx.delete(schema.session).where(eq(schema.session.userId, user.id));
  });

  revalidatePath("/admin");
}
