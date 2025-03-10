"use client";

import { FormInput } from "@/components/form/input";
import { FormSubmit } from "@/components/form/submit";
import type { Ride } from "@/db/zod";
import { addDays, format } from "date-fns";
import Form from "next/form";
import { useActionState } from "react";
import { action } from "./actions";
import { type State, validator } from "./validate";

export function UpsertForm({ ride }: { ride: Ride | undefined }) {
  const [state, formAction] = useActionState<State, FormData>(
    async (prev, formData) => {
      const validated = validator(formData);
      if (validated.errors) return validated;
      const res = await action(ride?.id, prev, formData);
      return res;
    },
    { errors: {} },
  );
  return (
    <Form className="flex flex-col gap-4" action={formAction}>
      <FormInput
        required={true}
        name="name"
        placeholder="Chilterns 100"
        label="Name"
        errors={state.errors?.name}
        defaultValue={(state.formData?.get("name") as string) ?? ride?.name ?? ""}
      />
      <FormInput
        required={true}
        type="date"
        name="date"
        label="Date"
        errors={state.errors?.date}
        defaultValue={
          (state.formData?.get("date") as string) ??
          format(ride?.date ?? addDays(new Date(), 1), "yyyy-MM-dd")
        }
      />
      <FormInput
        required={true}
        type="time"
        name="time"
        label="Time"
        errors={state.errors?.time}
        defaultValue={(state.formData?.get("time") as string) ?? ride?.time ?? "09:00"}
      />
      <FormInput
        required={false}
        type="number"
        name="speed"
        label="Speed"
        placeholder="28"
        errors={state.errors?.speed}
        defaultValue={(state.formData?.get("speed") as string) ?? ride?.speed ?? ""}
      />
      <FormInput
        required={true}
        name="route"
        placeholder="https://www.strava.com/routes/..."
        label="Route"
        errors={state.errors?.route}
        defaultValue={(state.formData?.get("route") as string) ?? ride?.route ?? ""}
      />
      <FormSubmit>{ride ? "Save" : "Add ride"}</FormSubmit>
    </Form>
  );
}
