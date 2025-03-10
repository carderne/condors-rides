import { z } from "zod";

type InferFieldErrors<T extends z.ZodType> = {
  [K in keyof z.infer<T>]?: string[] | undefined;
};
type ActionStateError<T extends z.ZodType> = {
  data?: never;
  formData?: FormData;
  errors: InferFieldErrors<T>;
  notify?: { type: "success" | "error"; message: string };
};

type ActionStateSuccess<T extends z.ZodType> = {
  data: z.infer<T>;
  formData?: never;
  errors?: never;
  notify?: { type: "success" | "error"; message: string };
};

export type ActionState<T extends z.ZodType> = ActionStateSuccess<T> | ActionStateError<T>;

const _voidSchema = z.void();
export type VoidActionState = ActionState<typeof _voidSchema>;

export function createValidator<T extends z.ZodType>(schema: T) {
  return (formData: FormData): ActionState<T> => {
    const formDataObj = Object.fromEntries(formData);
    const { data, error } = schema.safeParse(formDataObj);
    if (error) {
      return { formData, errors: error.flatten().fieldErrors };
    }
    return { data };
  };
}
