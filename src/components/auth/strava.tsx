"use client";

import { StravaLogo } from "@/components/svg/oauth";
import { Button } from "@/components/ui/button";
import { signUpSocialAction } from "./actions";

export function SignInStrava({ redirectUrl }: { redirectUrl: string }) {
  return (
    <Button variant="default" onClick={() => signUpSocialAction(redirectUrl, "/sign-in", "strava")}>
      <div className="rounded-full bg-white p-1">
        <StravaLogo />
      </div>
      <span>Continue with Strava</span>
    </Button>
  );
}
