import { db, schema } from "@/db";
import type { User } from "@/db/zod";
import { auth } from "@/lib/auth";
import { invariant } from "@/lib/invariant";
import { getPathOnServer } from "@/lib/path";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export async function getAdminUser(): Promise<User> {
  const user = await getMembership();
  if (user.type !== "admin") {
    return notFound();
  }
  return user;
}

export async function getSuperUser(): Promise<User> {
  const user = await getMembership();
  if (user.type !== "admin" && user.type !== "super") {
    return notFound();
  }
  return user;
}

export async function getMembership(): Promise<User> {
  const user = await maybeGetMembership();
  if (!user) {
    const path = await getPathOnServer();
    redirect(`/sign-in?returnTo=${encodeURIComponent(path)}`);
  }
  return user;
}

export async function maybeGetMembership(): Promise<User | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return null;
  }

  const user = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id),
  });
  invariant(user);

  return user;
}
