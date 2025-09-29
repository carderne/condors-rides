import { FormInput } from "@/components/form/input";
import { FormSubmit } from "@/components/form/submit";
import Form from "next/form";
import { signUpEmailAction } from "./actions";

export function SignUpEmailDevOnly({
  signInVariant,
  redirectUrl,
}: {
  signInVariant: boolean;
  redirectUrl: string;
}) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  return (
    <div className="absolute bottom-10 left-10 w-60 md:block">
      <Form
        className="flex flex-col gap-2"
        action={signUpEmailAction.bind(null, signInVariant, redirectUrl)}
      >
        <div className="text-status-warning font-bold">DEV ONLY</div>
        <FormInput
          name="email"
          type="email"
          required={true}
          placeholder="you@yours.com"
          className="!h-8"
        />
        <FormInput
          name="password"
          type="password"
          required={true}
          placeholder="password"
          className="!h-8"
        />
        <FormSubmit>{signInVariant ? "Sign In" : "Sign Up"}</FormSubmit>
      </Form>
    </div>
  );
}
