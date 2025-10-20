import { FormSubmit } from "@/components/form/submit";
import { Input } from "@/components/ui/input";
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
    <div className="top-30 left-10 block w-60 md:absolute">
      <Form
        className="flex flex-col gap-2"
        action={signUpEmailAction.bind(null, signInVariant, redirectUrl)}
      >
        <div className="text-status-warning font-bold">DEV ONLY</div>
        <Input
          name="email"
          type="email"
          required={true}
          placeholder="you@yours.com"
          className="!h-8"
        />
        <Input
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
