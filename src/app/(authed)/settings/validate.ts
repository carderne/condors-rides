import { createValidator, type ActionState } from "@/lib/forms";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
  name: zfd.text(z.string().min(5)),
});
export type Schema = typeof schema;
export type State = ActionState<Schema>;
export const validator = createValidator<Schema>(schema);
