import { rideSurfaceArray, routeDirectionArray } from "@/db/schema";
import { createValidator, type ActionState } from "@/lib/forms";
import { zodToNames } from "@/lib/zod-keys";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
  name: zfd.text(),
  distance: zfd.numeric(z.number().int()),
  direction: zfd.text(z.enum(routeDirectionArray)),
  elevation: zfd.numeric(z.number().int().optional()),
  surface: z.enum(rideSurfaceArray),
  cafeStop: zfd.text(z.string().optional()),
  notes: zfd.text(z.string().optional()),
});

type Schema = typeof schema;

export type State = ActionState<Schema>;
export const validator = createValidator<Schema>(schema);
export const names = zodToNames(schema);
