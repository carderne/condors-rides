"use server";

import { getAdmin } from "@/dal/membership";
import { db, schema } from "@/db";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export async function banUserAction(userId: string) {
  await getAdmin();

  const where = and(eq(schema.user.id, userId), ne(schema.user.type, "admin"));
  const userToBan = await db.query.user.findFirst({ where });

  if (!userToBan) {
    return notFound();
  }

  await db.transaction(async (tx) => {
    await tx.update(schema.user).set({ deactivatedAt: new Date() }).where(where);
    await tx.delete(schema.session).where(eq(schema.session.userId, userId));
  });

  revalidatePath("/admin");
}

export async function unbanUserAction(userId: string) {
  await getAdmin();
  await db.update(schema.user).set({ deactivatedAt: null }).where(eq(schema.user.id, userId));
  revalidatePath("/admin");
}
