"use client";

import { GoogleLogo } from "@/components/svg/oauth";
import { Button } from "@/components/ui/button";
import { signUpSocialAction } from "./actions";

export function SignInGoogle({ redirectUrl }: { redirectUrl: string }) {
  return (
    <Button
      variant="secondary"
      onClick={() => signUpSocialAction(redirectUrl, "/sign-in", "google")}
    >
      <GoogleLogo />
      <span>Continue with Google</span>
    </Button>
  );
}
