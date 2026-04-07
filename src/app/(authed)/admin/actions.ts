"use server";

import { getAdminUser } from "@/dal/membership";
import { db, schema } from "@/db";
import { invariant } from "@/lib/invariant";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function banUserAction(userId: string) {
  await getAdminUser();

  const where = and(eq(schema.user.id, userId), ne(schema.user.type, "admin"));
  const userToBan = await db.query.user.findFirst({ where });
  invariant(userToBan);
  const name = `${userToBan.name} [BANNED]`;

  await db.transaction(async (tx) => {
    await tx.update(schema.user).set({ name, deletedAt: new Date() }).where(where);
    await tx.delete(schema.session).where(eq(schema.session.userId, userId));
  });

  revalidatePath("/admin");
}

export async function verifyUserAction(userId: string) {
  await getAdminUser();
  await db.update(schema.user).set({ verifiedAt: new Date() }).where(eq(schema.user.id, userId));
  revalidatePath("/admin");
}
