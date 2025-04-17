"use client";

import { FacebookLogo } from "@/components/svg/oauth";
import { Button } from "@/components/ui/button";
import { signUpSocialAction } from "./actions";

export function SignInFacebook({ redirectUrl }: { redirectUrl: string }) {
  return (
    <Button
      variant="default"
      onClick={() => signUpSocialAction(redirectUrl, "/sign-in", "facebook")}
    >
      <div className="rounded-full bg-white p-1">
        <FacebookLogo />
      </div>
      <span>Continue with Facebook</span>
    </Button>
  );
}
