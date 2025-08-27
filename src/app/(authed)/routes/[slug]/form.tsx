"use client";

import { FormInput } from "@/components/form/input";
import { FormSelectTrigger } from "@/components/form/select";
import { FormSubmit } from "@/components/form/submit";
import { FormTextarea } from "@/components/form/textarea";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import type { Route } from "@/db/zod";
import Form from "next/form";
import { useActionState } from "react";
import { action } from "./actions";
import { names, type State, validator } from "./validate";

export function UpsertForm({ route }: { route: Route }) {
  const [state, formAction] = useActionState<State, FormData>(
    async (prev, formData) => {
      const validated = validator(formData);
      if (validated.errors) return validated;
      const res = await action(route.id, prev, formData);
      return res;
    },
    { errors: {} },
  );
  const formErrorMsg =
    state.errors && Object.keys(state.errors).length > 0 ? ["Scroll up to see errors"] : [];

  return (
    <Form className="flex flex-col gap-4" action={formAction}>
      <div>
        <span className="text-red-500">*</span> denotes required fields
      </div>
      <FormInput
        required={true}
        name={names.name}
        placeholder="Chilterns 100"
        label="Ride name"
        errors={state.errors?.name}
        defaultValue={(state.formData?.get(names.name) as string) ?? route?.name ?? ""}
      />

      <FormInput
        required={true}
        type="number"
        name={names.distance}
        label="Distance"
        labelSuffix="km"
        placeholder="90"
        errors={state.errors?.distance}
        defaultValue={(state.formData?.get(names.distance) as string) ?? route?.distance ?? ""}
      />
      <FormInput
        required={false}
        type="number"
        name={names.elevation}
        label="Elevation"
        labelSuffix="m"
        placeholder="450"
        errors={state.errors?.elevation}
        defaultValue={(state.formData?.get(names.elevation) as string) ?? route?.elevation ?? ""}
      />
      <FormInput
        required={false}
        name={names.cafeStop}
        placeholder="Waterperry Gardens Tea Stop"
        label="Cafe stop"
        errors={state.errors?.cafeStop}
        defaultValue={(state.formData?.get(names.cafeStop) as string) ?? route?.cafeStop ?? ""}
      />
      <FormTextarea
        required={false}
        name={names.notes}
        placeholder="Not too hily but we will regroup at the top."
        label="Notes"
        errors={state.errors?.notes}
        defaultValue={(state.formData?.get(names.notes) as string) ?? route?.notes ?? ""}
      />

      <Select
        name={names.surface}
        defaultValue={(state.formData?.get(names.surface) as string) ?? route?.surface ?? "road"}
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
      <FormSubmit className="w-full">{route ? "Save" : "Add ride"}</FormSubmit>
    </Form>
  );
}
