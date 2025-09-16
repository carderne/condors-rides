import { createValidator, type ActionState } from "@/lib/forms";
import { zodToNames } from "@/lib/zod-keys";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
  options: z
    .string()
    .transform((value) => (value.length > 0 ? value.split(",") : []))
    .pipe(z.string().array()),
  comment: zfd.text(z.string().optional()),
});

export type Schema = typeof schema;

export type State = ActionState<Schema>;
export const validator = createValidator<Schema>(schema);
export const names = zodToNames(schema);
