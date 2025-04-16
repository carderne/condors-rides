import { createValidator, type ActionState } from "@/lib/forms";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
  unclaimed: zfd.checkbox(),
  name: zfd.text(),
  date: zfd.text(z.coerce.date()),
  time: zfd.text(),
  speed: zfd.text(),
  distance: zfd.numeric(z.number().int()),
  elevation: zfd.numeric(z.number().int().optional()),
  route: zfd.text(z.string().optional()),
  maxGroupSize: zfd.numeric(z.number().optional()),
  cafeStop: zfd.text(z.string().optional()),
  notes: zfd.text(z.string().optional()),
});

type Schema = typeof schema;

export type State = ActionState<Schema>;
export const validator = createValidator<Schema>(schema);
