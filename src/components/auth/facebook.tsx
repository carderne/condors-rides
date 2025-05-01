"use client";

import { FacebookLogo } from "@/components/svg/oauth";
import { Button } from "@/components/ui/button";
import { signUpSocialAction } from "./actions";

export function SignInFacebook({ redirectUrl }: { redirectUrl: string }) {
  return (
    <Button
      className="flex h-12 gap-4 font-bold"
      variant="default"
      onClick={() => signUpSocialAction(redirectUrl, "/sign-in", "facebook")}
    >
      <FacebookLogo />
      <span>Continue with Facebook</span>
    </Button>
  );
}
