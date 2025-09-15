import { SignInFacebook } from "@/components/auth/facebook";
import { SignInGoogle } from "@/components/auth/google";
import { H2, H3 } from "@/components/ui/typography";
import { auth } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

const config = getConfig();

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // Don't use @/lib/session/getSession here
  // as it redirects to this page if no session...
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect("/");
  }

  const redirectSuffix = "/rides";
  const redirectUrl = new URL(redirectSuffix, config.baseUrl).toString();

  return (
    <main className="mt-40 flex w-full flex-col justify-center gap-8 text-center">
      {error && (
        <div>
          <p className="text-2xl font-bold">Sign up failed</p>
          <p>Please try again below</p>
        </div>
      )}
      <H2 className="text-primary z-10 font-sans text-5xl">Sign In</H2>
      <div>
        <H3 className="">Not yet a member? Not a problem!</H3>
        <p>You can join up to three rides, then we ask you to join the club</p>
        <p className="text-accent-foreground">
          You can read about joining the club{" "}
          <Link href="https://cowleyroadcondors.cc/join/" className="text-primary hover:underline">
            here
          </Link>
        </p>
      </div>
      <div className="z-10 mx-auto flex flex-col gap-4 md:w-72">
        <SignInGoogle redirectUrl={redirectUrl} />
        <SignInFacebook redirectUrl={redirectUrl} />
      </div>
      <div className="text-muted-foreground text-sm md:hidden">
        <p>
          <strong>Come here from the Facebook app?</strong>
        </p>
        <p>Make sure you open this page in your normal browser, not the in-app one!</p>
        <p>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://chatgpt.com/share/68c7eda4-f558-800a-b806-4d566c81de01"
            className="text-primary"
          >
            Click here for instructions
          </Link>
        </p>
      </div>
    </main>
  );
}
