"use server";

import { auth } from "@/lib/auth";
import { invariant } from "@/lib/invariant";
import { redirect } from "next/navigation";

export type Provider = "google" | "facebook";

export async function signUpSocialAction(
  redirectUrl: string,
  errorCallbackUrl: string,
  provider: Provider,
): Promise<never> {
  // This can throw, but only _after_ the redirect, so impossible to
  // handle in this function. Must rely on Better Auth error handling/codes
  const res = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: redirectUrl,
      errorCallbackURL: errorCallbackUrl,
    },
  });
  invariant(res.url, "No social sign in url");
  redirect(res.url);
}
