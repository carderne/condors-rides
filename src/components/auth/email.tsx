import { FormInput } from "@/components/form/input";
import { FormSubmit } from "@/components/form/submit";
import Form from "next/form";
import { signInEmailAction } from "./actions";

export function SignUpEmail({ redirectUrl, type }: { redirectUrl: string; type: "up" | "in" }) {
  return (
    <Form className="flex flex-col gap-2" action={signInEmailAction.bind(null, redirectUrl, type)}>
      <FormInput name="email" type="email" required={true} placeholder="you@yours.com" />
      <FormInput name="password" type="password" required={true} placeholder="password" />
      {type === "up" && <FormInput name="code" type="code" required={true} placeholder="kt..." />}
      <FormSubmit>{type === "up" ? "Sign Up" : "Sign in"}</FormSubmit>
    </Form>
  );
}
