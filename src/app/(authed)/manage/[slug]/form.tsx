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
        required={true}
        type="text"
        name="speed"
        label="Speed"
        placeholder="28"
        errors={state.errors?.speed}
        defaultValue={(state.formData?.get("speed") as string) ?? ride?.speed ?? ""}
      />
      <FormInput
        required={true}
        type="number"
        name="distance"
        label="Distance"
        placeholder="90"
        errors={state.errors?.distance}
        defaultValue={(state.formData?.get("distance") as string) ?? ride?.distance ?? ""}
      />
      <FormInput
        required={false}
        type="number"
        name="elevation"
        label="Elevation"
        placeholder="450"
        errors={state.errors?.elevation}
        defaultValue={(state.formData?.get("elevation") as string) ?? ride?.elevation ?? ""}
      />
      <FormInput
        required={false}
        name="route"
        placeholder="https://www.strava.com/routes/..."
        label="Route"
        errors={state.errors?.route}
        defaultValue={(state.formData?.get("route") as string) ?? ride?.route ?? ""}
      />
      <FormInput
        required={false}
        type="number"
        name="maxGroupSize"
        label="Max group size"
        placeholder="8"
        errors={state.errors?.maxGroupSize}
        defaultValue={(state.formData?.get("maxGroupSize") as string) ?? ride?.maxGroupSize ?? "8"}
      />
      <FormInput
        required={false}
        name="cafeStop"
        placeholder="Waterperry Gardens Tea Stop"
        label="Cafe stop"
        errors={state.errors?.cafeStop}
        defaultValue={(state.formData?.get("cafeStop") as string) ?? ride?.cafeStop ?? ""}
      />
      <FormInput
        required={false}
        name="notes"
        placeholder="Not too hily but we will regroup at the top."
        label="Notes"
        errors={state.errors?.notes}
        defaultValue={(state.formData?.get("notes") as string) ?? ride?.notes ?? ""}
      />
      <FormSubmit>{ride ? "Save" : "Add ride"}</FormSubmit>
    </Form>
  );
}
