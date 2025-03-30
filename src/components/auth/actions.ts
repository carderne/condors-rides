"use server";

import { auth } from "@/lib/auth";
import type { ActionState } from "@/lib/forms";
import { invariant } from "@/lib/invariant";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string(),
  password: z.string(),
  code: z.string().optional(),
});
export type SignUpState = ActionState<typeof signUpSchema>;

export async function signInEmailAction(
  redirectUrl: string,
  type: "up" | "in",
  formData: FormData,
): Promise<never> {
  const rawFormData = Object.fromEntries(formData);
  const data = signUpSchema.parse(rawFormData);
  const { email, password, code } = data;

  if (type === "up" && code !== "ktfu") {
    throw new Error("UNAUTHORIZED");
  }

  // This call can throw, but this is only used in DEV so
  // no point trying to handle it
  const [name] = email.split("@");
  invariant(name);
  if (type === "up") {
    await auth.api.signUpEmail({
      body: { email, password, name },
      headers: await headers(),
    });
  } else {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  }
  redirect(redirectUrl);
}

export type Provider = "google";

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
