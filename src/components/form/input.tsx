import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { errorInputStyle, FormError } from "./error";

interface FormInputProps extends ComponentProps<"input"> {
  label?: React.ReactNode;
  errors?: string[];
}

export function FormInput({ label, errors, ...props }: FormInputProps) {
  return (
    <Label htmlFor={props.id} text={label}>
      <Input {...props} className={cn(props.className, !!errors?.length && errorInputStyle)} />
      <FormError errors={errors} />
    </Label>
  );
}
