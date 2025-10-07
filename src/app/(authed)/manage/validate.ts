import { rideSurfaceArray } from "@/db/schema";
import { createValidator, type ActionState } from "@/lib/forms";
import { zodToNames } from "@/lib/zod-keys";
import { addDays } from "date-fns";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
  name: zfd.text(),
  date: zfd.text(
    z.coerce.date().min(addDays(new Date(), -1), { message: "Don't create rides in the past!" }),
  ),
  time: zfd.text(),
  speed: zfd.text(),
  distance: zfd.numeric(z.number().int()),
  elevation: zfd.numeric(z.number().int().optional()),
  routeUrl: zfd.text(z.string().optional()),
  maxGroupSize: zfd.numeric(z.number().optional()),
  cafeStop: zfd.text(z.string().optional()),
  startPoint: zfd.text(),
  notes: zfd.text(z.string().optional()),
  surface: z.enum(rideSurfaceArray),
});

type Schema = typeof schema;

export type State = ActionState<Schema>;
export const validator = createValidator<Schema>(schema);
export const names = zodToNames(schema);
