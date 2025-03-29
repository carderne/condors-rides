import { type ActionState, createValidator } from "@/lib/forms";
import { z } from "zod";

const schema = z.object({
  text: z.string().min(5),
});
type Schema = typeof schema;

export type State = ActionState<Schema>;
export const validator = createValidator<Schema>(schema);
