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
      <H3 className="">Sign in to create and join rides, comment etc!</H3>
      <div className="z-10 mx-auto flex flex-col gap-4 md:w-72">
        <SignInGoogle redirectUrl={redirectUrl} />
      </div>
      <div className="flex items-center justify-center gap-2 text-center">
        Need an account?
        <Link href="/sign-up" className="text-primary">
          sign up!
        </Link>
      </div>
    </main>
  );
}
