import { createValidator, type ActionState } from "@/lib/forms";
import { z } from "zod";

const schema = z.object({
  name: z.string().nonempty(),
  date: z.coerce.date(),
  time: z.string().nonempty(),
  speed: z.string().nonempty(),
  route: z.string().nonempty(),
});

type Schema = typeof schema;

export type State = ActionState<Schema>;
export const validator = createValidator<Schema>(schema);
