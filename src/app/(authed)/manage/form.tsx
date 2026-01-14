"use client";

import { Container } from "@/components/container";
import { FormInput } from "@/components/form/input";
import { FormSubmit } from "@/components/form/submit";
import { FormTextarea } from "@/components/form/textarea";
import { Button } from "@/components/ui/button";
import { H2 } from "@/components/ui/typography";
import { rideSurfaceArray, type Surface } from "@/db/schema";
import type { Ride } from "@/db/zod";
import { formatISODate } from "@/lib/fmt";
import { surfaceStyle } from "@/lib/surface";
import { cn } from "@/lib/utils";
import { addDays, format, getDate } from "date-fns";
import Form from "next/form";
import { useActionState, useState } from "react";
import { action } from "./actions";
import { names, type State, validator } from "./validate";

export function UpsertForm({ ride }: { ride: Partial<Ride> | undefined }) {
  const [surface, setSurface] = useState<Surface>(ride?.surface ?? "road");

  const [state, formAction] = useActionState<State, FormData>(
    async (prev, formData) => {
      const validated = validator(formData);
      if (validated.errors) {
        console.log("form errors", validated.errors);
        return validated;
      }
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
    <Container className="md:max-w-3xl">
      <H2>{ride === undefined ? "New ride" : "Edit ride"}</H2>
      <Form className="flex flex-col gap-4" action={formAction}>
        <div className="grid grid-cols-3 items-center justify-around gap-2 px-2 md:ml-32">
          {rideSurfaceArray.map((s) => (
            <Button
              type="button"
              onClick={() => setSurface(s)}
              key={s}
              className={cn("h-20", s === surface && surfaceStyle(s).button)}
              variant="outline"
            >
              {surfaceStyle(s).label}
            </Button>
          ))}
        </div>
        <input name={names.surface} hidden={true} readOnly={true} value={surface} />

        <FormInput
          required={true}
          name={names.name}
          placeholder="Chilterns 100"
          label="Name"
          errors={state.errors?.name}
          defaultValue={(state.formData?.get(names.name) as string) ?? ride?.name ?? ""}
        />

        <div className="grid grid-cols-3 items-center justify-around gap-2 px-2 md:ml-32 md:grid-cols-6">
          {nextweek.map((d) => (
            <Button
              type="button"
              onClick={() => onClickAutoDate(d)}
              key={d.toISOString()}
              className={cn("text-xs", formatISODate(d) === date ? "bg-primary/40" : "")}
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
            "Manzil Way Gardens"
          }
        />
        {["road", "offroad"].includes(surface) && (
          <FormInput
            required={["road", "offroad"].includes(surface)}
            type="text"
            name={names.speed}
            label="Speed"
            labelSuffix={surface === "road" ? "kph on the flat" : "road equivalent"}
            placeholder="28"
            errors={state.errors?.speed}
            defaultValue={(state.formData?.get(names.speed) as string) ?? ride?.speed ?? ""}
          />
        )}
        {["road", "offroad", "virtual", "external"].includes(surface) && (
          <FormInput
            required={["road", "offroad", "virtual", "external"].includes(surface)}
            type="number"
            name={names.distance}
            label="Distance"
            labelSuffix="km"
            placeholder="90"
            errors={state.errors?.distance}
            defaultValue={(state.formData?.get(names.distance) as string) ?? ride?.distance ?? ""}
          />
        )}
        {["road", "offroad", "virtual", "external"].includes(surface) && (
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
        )}
        {["road", "offroad", "virtual", "external"].includes(surface) && (
          <FormInput
            required={false}
            name={names.routeUrl}
            placeholder="https://www.strava.com/routes/..."
            label="Route"
            errors={state.errors?.routeUrl}
            defaultValue={(state.formData?.get(names.routeUrl) as string) ?? ride?.routeUrl ?? ""}
          />
        )}
        {["road", "offroad"].includes(surface) && (
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
        )}
        {["road", "offroad"].includes(surface) && (
          <FormInput
            required={false}
            name={names.cafeStop}
            placeholder="Waterperry Gardens Tea Stop"
            label="Cafe stop"
            errors={state.errors?.cafeStop}
            defaultValue={(state.formData?.get(names.cafeStop) as string) ?? ride?.cafeStop ?? ""}
          />
        )}
        <FormTextarea
          required={false}
          name={names.notes}
          placeholder="Not too hilly but we will regroup at the top."
          label="Notes"
          errors={state.errors?.notes}
          defaultValue={(state.formData?.get(names.notes) as string) ?? ride?.notes ?? ""}
        />

        <div className="text-xl text-red-600 md:ml-auto">{formErrorMsg}</div>
        <FormSubmit className="h-20! w-full text-xl">{ride ? "Save" : "Add ride"}</FormSubmit>
      </Form>
    </Container>
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
