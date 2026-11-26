"use server";

import { deleteObject, putObject } from "@/clients/s3";
import { getMembership } from "@/dal/membership";
import { db, schema } from "@/db";
import {
  AvatarError,
  avatarKeyFromUrl,
  avatarUrl,
  newAvatarKey,
  processAvatar,
} from "@/lib/avatar";
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

export async function uploadAvatarAction(formData: FormData): Promise<{ error?: string }> {
  const user = await getMembership();

  const file = formData.get("image");
  if (!(file instanceof File)) return { error: "No image selected" };

  let webp: Uint8Array;
  try {
    webp = await processAvatar(new Uint8Array(await file.arrayBuffer()));
  } catch (e) {
    if (e instanceof AvatarError) return { error: e.message };
    throw e;
  }

  const key = newAvatarKey(user.id);
  await putObject(key, webp, "image/webp");
  await db
    .update(schema.user)
    .set({ image: avatarUrl(key) })
    .where(eq(schema.user.id, user.id));
  await deleteOldAvatar(user.image);

  revalidatePath("/", "layout");
  return {};
}

export async function removeAvatarAction() {
  const user = await getMembership();
  await db.update(schema.user).set({ image: null }).where(eq(schema.user.id, user.id));
  await deleteOldAvatar(user.image);
  revalidatePath("/", "layout");
}

async function deleteOldAvatar(url: string | null) {
  const key = avatarKeyFromUrl(url);
  if (!key) return;
  try {
    await deleteObject(key);
  } catch (e) {
    // Orphaned object is harmless, don't fail the request
    console.error("Failed to delete old avatar", key, e);
  }
}

export async function deleteAccountAction() {
  const user = await getMembership();

  const where = eq(schema.user.id, user.id);
  const accountToDelete = await db.query.user.findFirst({ where });
  invariant(accountToDelete);
  const name = `${accountToDelete.name} [DELETED]`;

  await db.transaction(async (tx) => {
    await tx.update(schema.user).set({ name, deletedAt: new Date() }).where(where);
    await tx.delete(schema.session).where(eq(schema.session.userId, user.id));
  });

  revalidatePath("/settings");
}
