"use client";

import { FormInput } from "@/components/form/input";
import { FormSelectTrigger } from "@/components/form/select";
import { FormSubmit } from "@/components/form/submit";
import { FormTextarea } from "@/components/form/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import type { Ride } from "@/db/zod";
import { formatISODate } from "@/lib/fmt";
import { cn } from "@/lib/utils";
import { addDays, format, getDate } from "date-fns";
import Form from "next/form";
import { useActionState, useState } from "react";
import { action } from "./actions";
import { names, type State, validator } from "./validate";

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
  const [date, setDate] = useState<string>(
    (state.formData?.get("date") as string) ?? formatISODate(ride?.date ?? addDays(new Date(), 1)),
  );

  const formErrorMsg =
    state.errors && Object.keys(state.errors).length > 0 ? ["Scroll up to see errors"] : [];

  const onClickAutoDate = (d: Date) => {
    setDate(formatISODate(d));
  };

  const now = new Date();
  const nextweek = Array.from({ length: 6 }, (_, i) => addDays(now, i));

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
        defaultValue={(state.formData?.get(names.name) as string) ?? ride?.name ?? ""}
      />

      <div className="grid grid-cols-3 items-center justify-around gap-2 px-2 md:ml-32 md:grid-cols-6">
        {nextweek.map((d) => (
          <Button
            type="button"
            onClick={() => onClickAutoDate(d)}
            key={d.toISOString()}
            className={cn("text-xs", formatISODate(d) === date ? "!bg-primary/40" : "")}
            variant="outline"
          >
            {formatDay(d)}
          </Button>
        ))}
      </div>

      <FormInput
        required={true}
        // doesn't show full-width on safari otherwise
        className="w-[calc(100vw-2rem)] md:w-full"
        type="date"
        name={names.date}
        label="Date"
        errors={state.errors?.date}
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <FormInput
        required={true}
        // doesn't show full-width on safari otherwise
        className="w-[calc(100vw-2rem)] md:w-full"
        type="time"
        name={names.time}
        label="Time"
        errors={state.errors?.time}
        defaultValue={(state.formData?.get(names.time) as string) ?? ride?.time ?? "09:00"}
      />
      <FormInput
        required={true}
        name={names.startPoint}
        label="Start"
        labelSuffix="can be lat/lon coords"
        errors={state.errors?.startPoint}
        defaultValue={
          (state.formData?.get(names.startPoint) as string) ??
          ride?.startPoint ??
          "Beeline Bicycles"
        }
      />
      <FormInput
        required={true}
        type="text"
        name={names.speed}
        label="Speed"
        labelSuffix="kph on the flat"
        placeholder="28"
        errors={state.errors?.speed}
        defaultValue={(state.formData?.get(names.speed) as string) ?? ride?.speed ?? ""}
      />
      <FormInput
        required={true}
        type="number"
        name={names.distance}
        label="Distance"
        labelSuffix="km"
        placeholder="90"
        errors={state.errors?.distance}
        defaultValue={(state.formData?.get(names.distance) as string) ?? ride?.distance ?? ""}
      />
      <FormInput
        required={false}
        type="number"
        name={names.elevation}
        label="Elevation"
        labelSuffix="m"
        placeholder="450"
        errors={state.errors?.elevation}
        defaultValue={(state.formData?.get(names.elevation) as string) ?? ride?.elevation ?? ""}
      />
      <FormInput
        required={false}
        name={names.routeUrl}
        placeholder="https://www.strava.com/routes/..."
        label="Route"
        errors={state.errors?.routeUrl}
        defaultValue={(state.formData?.get(names.routeUrl) as string) ?? ride?.routeUrl ?? ""}
      />
      <FormInput
        required={false}
        type="number"
        name={names.maxGroupSize}
        label="Max riders"
        labelSuffix="app will enforce!"
        placeholder="8"
        errors={state.errors?.maxGroupSize}
        defaultValue={(state.formData?.get(names.maxGroupSize) as string) ?? ride?.maxGroupSize}
      />
      <FormInput
        required={false}
        name={names.cafeStop}
        placeholder="Waterperry Gardens Tea Stop"
        label="Cafe stop"
        errors={state.errors?.cafeStop}
        defaultValue={(state.formData?.get(names.cafeStop) as string) ?? ride?.cafeStop ?? ""}
      />
      <FormTextarea
        required={false}
        name={names.notes}
        placeholder="Not too hily but we will regroup at the top."
        label="Notes"
        errors={state.errors?.notes}
        defaultValue={(state.formData?.get(names.notes) as string) ?? ride?.notes ?? ""}
      />

      <Select
        name={names.surface}
        defaultValue={(state.formData?.get(names.surface) as string) ?? ride?.surface ?? "road"}
      >
        <FormSelectTrigger label="Surface" errors={state.errors?.surface}>
          <SelectValue />
        </FormSelectTrigger>
        <SelectContent>
          <SelectItem value="road">Road</SelectItem>
          <SelectItem value="gravel">Gravel</SelectItem>
          <SelectItem value="virtual">Virtual</SelectItem>
        </SelectContent>
      </Select>
      <div className="text-xl text-red-600 md:ml-auto">{formErrorMsg}</div>
      <FormSubmit className="!h-20 w-full text-xl">{ride ? "Save" : "Add ride"}</FormSubmit>
    </Form>
  );
}

function formatDay(d: Date): string {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  if (getDate(d) === getDate(now)) {
    return "today";
  }
  if (getDate(d) === getDate(tomorrow)) {
    return "tmrw";
  }
  return format(d, "EEE do");
}
