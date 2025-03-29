import type { User } from "@/db/zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getMembership(): Promise<User> {
  const user = await maybeGetMembership();
  if (!user) {
    redirect("/sign-in");
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

  const { user } = session;
  return user as User;
}
