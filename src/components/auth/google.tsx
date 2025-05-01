"use client";

import { GoogleLogo } from "@/components/svg/oauth";
import { Button } from "@/components/ui/button";
import { signUpSocialAction } from "./actions";

export function SignInGoogle({ redirectUrl }: { redirectUrl: string }) {
  return (
    <Button
      className="flex h-12 gap-4 font-bold"
      variant="default"
      onClick={() => signUpSocialAction(redirectUrl, "/sign-in", "google")}
    >
      <GoogleLogo />
      <span>Continue with Google</span>
    </Button>
  );
}
