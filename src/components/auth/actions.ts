"use server";

import { auth } from "@/lib/auth";
import { invariant } from "@/lib/invariant";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

type Provider = "google" | "facebook" | "apple";

export async function signUpSocialAction(
  redirectUrl: string,
  errorCallbackUrl: string,
  provider: Provider,
): Promise<never> {
  // This can throw, but only _after_ the redirect, so impossible to
  // handle in this function. Must rely on Better Auth error handling/codes
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

const signUpSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string(),
});

export async function signUpEmailAction(
  signInVariant: boolean,
  redirectUrl: string,
  formData: FormData,
): Promise<never> {
  if (process.env.NODE_ENV === "production") {
    return notFound();
  }

  const rawFormData = Object.fromEntries(formData);
  const data = signUpSchema.parse(rawFormData);

  // This call can throw, but this is only used in DEV so
  // no point trying to handle it
  const [name] = data.email.split("@");
  invariant(name);

  if (signInVariant) {
    await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
      headers: await headers(),
    });
  } else {
    await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name,
      },
      headers: await headers(),
    });
  }
  redirect(redirectUrl);
}
