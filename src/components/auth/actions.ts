"use server";

import { auth } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { invariant } from "@/lib/invariant";
import { redirect } from "next/navigation";

export type Provider = "google" | "facebook" | "strava";

const config = getConfig();

export async function signUpSocialAction(
  redirectUrl: string,
  errorCallbackUrl: string,
  provider: Provider,
): Promise<never> {
  // These can throw, but only _after_ the redirect, so impossible to
  // handle in this function. Must rely on Better Auth error handling/codes

  if (provider === "strava") {
    const base = "https://www.strava.com";
    const redirectUri = new URL("/api/strava/callback", config.baseUrl);
    const url = new URL("/oauth/authorize", base);
    url.searchParams.append("client_id", config.strava.clientId);
    url.searchParams.append("redirect_uri", redirectUri.toString());
    url.searchParams.append("approval_prompt", "force");
    url.searchParams.append("response_type", "code");
    url.searchParams.append("scope", "read");

    redirect(url.toString());

    // const res = await auth.api.signInWithOAuth2({
    //   body: {
    //     providerId: "strava",
    //     callbackURL: redirectUrl,
    //     errorCallbackURL: errorCallbackUrl,
    //   },
    // });
    // invariant(res.url, "No social sign in url");
    // redirect(res.url);
  }

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
