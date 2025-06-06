"use client";

import { FormInput } from "@/components/form/input";
import { FormSubmit } from "@/components/form/submit";
import type { User } from "@/db/zod";
import Form from "next/form";
import { useActionState } from "react";
import { action } from "./actions";
import { type State, validator } from "./validate";

export function UserSettingsForm({ user }: { user: User }) {
  const [state, formAction] = useActionState<State, FormData>(
    async (prev, formData) => {
      const validated = validator(formData);
      if (validated.errors) return validated;
      const res = await action(prev, formData);
      return res;
    },
    { errors: {} },
  );
  return (
    <Form className="flex flex-col gap-4" action={formAction}>
      <FormInput
        required={false}
        name="email"
        label="Email"
        disabled={true}
        defaultValue={user.email}
      />
      <FormInput
        required={true}
        name="name"
        label="Name"
        labelSuffix="don't be silly"
        errors={state.errors?.name}
        defaultValue={(state.formData?.get("name") as string) ?? user.name}
      />

      <FormSubmit className="w-full">Save</FormSubmit>
    </Form>
  );
}
