"use client";

import { GoogleLogo } from "@/components/svg/oauth";
import { Button } from "@/components/ui/button";
import { signUpSocialAction } from "./actions";

export function SignInGoogle({ redirectUrl }: { redirectUrl: string }) {
  return (
    <Button variant="default" onClick={() => signUpSocialAction(redirectUrl, "/sign-in", "google")}>
      <div className="rounded-full bg-white p-1">
        <GoogleLogo />
      </div>
      <span>Continue with Google</span>
    </Button>
  );
}
