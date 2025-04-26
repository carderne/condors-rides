"use client";

import { FormInput } from "@/components/form/input";
import { FormSelectTrigger } from "@/components/form/select";
import { FormSubmit } from "@/components/form/submit";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import type { Ride } from "@/db/zod";
import { addDays, format } from "date-fns";
import Form from "next/form";
import { useActionState } from "react";
import { action } from "./actions";
import { type State, validator } from "./validate";

export function UpsertForm({ ride }: { ride: Partial<Ride> | undefined }) {
  const [state, formAction] = useActionState<State, FormData>(
    async (prev, formData) => {
      const validated = validator(formData);
      if (validated.errors) return validated;
      const res = await action(ride?.id, prev, formData);
      return res;
    },
    { errors: {} },
  );

  const formErrorMsg =
    state.errors && Object.keys(state.errors).length > 0 ? ["Scroll up to see errors"] : [];

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
        // doesn't show full-width on safari otherwise
        className="w-[calc(100vw-2rem)] md:w-full"
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
        // doesn't show full-width on safari otherwise
        className="w-[calc(100vw-2rem)] md:w-full"
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
        labelSuffix="kph on the flat"
        placeholder="28"
        errors={state.errors?.speed}
        defaultValue={(state.formData?.get("speed") as string) ?? ride?.speed ?? ""}
      />
      <FormInput
        required={true}
        type="number"
        name="distance"
        label="Distance"
        labelSuffix="km"
        placeholder="90"
        errors={state.errors?.distance}
        defaultValue={(state.formData?.get("distance") as string) ?? ride?.distance ?? ""}
      />
      <FormInput
        required={false}
        type="number"
        name="elevation"
        label="Elevation"
        labelSuffix="m"
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
        label="Max riders"
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

      <Select
        name="surface"
        defaultValue={(state.formData?.get("surface") as string) ?? ride?.surface ?? "road"}
      >
        <FormSelectTrigger label="Surface" errors={state.errors?.surface}>
          <SelectValue />
        </FormSelectTrigger>
        <SelectContent>
          <SelectItem value="road">Road</SelectItem>
          <SelectItem value="gravel">Gravel</SelectItem>
        </SelectContent>
      </Select>
      <div className="text-xl text-red-600 md:ml-auto">{formErrorMsg}</div>
      <FormSubmit className="w-full">{ride ? "Save" : "Add ride"}</FormSubmit>
    </Form>
  );
}
