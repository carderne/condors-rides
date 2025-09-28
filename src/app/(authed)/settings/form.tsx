"use client";

import { FormSubmit } from "@/components/form/submit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/db/zod";
import Form from "next/form";
import { useActionState } from "react";
import { action } from "./actions";
import { type State, validator } from "./validate";

export function UserSettingsForm({ user }: { user: User }) {
  const [_, formAction] = useActionState<State, FormData>(
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
      <div className="">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          required={false}
          disabled={true}
          className="w-full md:w-[30ch]"
          defaultValue={user.email}
        />
      </div>

      <div className="">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required={true}
          className="w-full md:w-[30ch]"
          defaultValue={user.name}
        />
      </div>

      <FormSubmit className="justify-start">Save</FormSubmit>
    </Form>
  );
}
