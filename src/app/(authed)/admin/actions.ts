"use server";

import { getAdmin } from "@/dal/membership";
import { db, schema } from "@/db";
import { invariant } from "@/lib/invariant";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function banUserAction(userId: string) {
  await getAdmin();

  const where = and(eq(schema.user.id, userId), ne(schema.user.type, "admin"));
  const userToBan = await db.query.user.findFirst({ where });
  invariant(userToBan);
  const name = `${userToBan.name} [BANNED]`;

  await db.transaction(async (tx) => {
    await tx.update(schema.user).set({ name, deactivatedAt: new Date() }).where(where);
    await tx.delete(schema.session).where(eq(schema.session.userId, userId));
  });

  revalidatePath("/admin");
}

export async function unbanUserAction(userId: string) {
  await getAdmin();
  const userToUnban = await db.query.user.findFirst({ where: eq(schema.user.id, userId) });
  invariant(userToUnban);
  const [name] = userToUnban.name.split(" [");
  invariant(name);
  await db.update(schema.user).set({ name, deactivatedAt: null }).where(eq(schema.user.id, userId));
  revalidatePath("/admin");
}
