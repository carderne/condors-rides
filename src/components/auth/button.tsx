"use client";

import { AppleLogo, GoogleLogo } from "@/components/svg/oauth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { FacebookLogo } from "../svg/oauth";
import { signUpSocialAction } from "./actions";

const localStorageKey = "techleap-last-auth-method";

const integrations = ["google", "facebook", "apple"] as const;
type Integration = (typeof integrations)[number];
const logos: Record<Integration, React.ComponentType> = {
  google: GoogleLogo,
  facebook: FacebookLogo,
  apple: AppleLogo,
};
const titles: Record<Integration, string> = {
  google: "Google",
  facebook: "Facebook",
  apple: "Apple",
};

function SignInButton({
  redirectUrl,
  errorCallbackUrl,
  integration,
  lastUsed = false,
}: {
  redirectUrl: string;
  errorCallbackUrl: string;
  integration: Integration;
  lastUsed?: boolean;
}) {
  const handleClick = () => {
    localStorage.setItem(localStorageKey, integration);
    signUpSocialAction(redirectUrl, errorCallbackUrl, integration);
  };

  const Logo = logos[integration];

  return (
    <div className={cn(lastUsed ? "bg-primary/40 -mr-2 -ml-2 rounded-lg px-2 pt-2" : "")}>
      <Button
        variant="default"
        className="flex h-12 w-full items-center pl-12 font-bold"
        onClick={handleClick}
      >
        <div className="mr-4">
          <Logo />
        </div>
        <span className="flex-1 text-left">Continue with {titles[integration]}</span>
      </Button>
      {lastUsed && <div className="py-1 text-xs font-medium">Last used</div>}
    </div>
  );
}

export function AllSignInButtons({
  redirectUrl,
  errorCallbackUrl,
}: {
  redirectUrl: string;
  errorCallbackUrl: string;
}) {
  const [lastAuth, setLastAuth] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(localStorageKey);
    setLastAuth(stored);
  }, []);

  const integrationsWithLastUsed = integrations.map((integration) => ({
    integration,
    lastUsed: integration === lastAuth,
  }));

  return integrationsWithLastUsed.map(({ integration, lastUsed }) => (
    <SignInButton
      key={integration}
      redirectUrl={redirectUrl}
      errorCallbackUrl={errorCallbackUrl}
      integration={integration}
      lastUsed={lastUsed}
    />
  ));
}
