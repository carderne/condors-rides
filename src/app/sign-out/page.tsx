import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

export default async function SignOutPage() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/", RedirectType.push);
}
