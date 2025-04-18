import { Label } from "@/components/ui/label";
import { SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { errorInputStyle, FormError } from "./error";

interface FormSelectTriggerProps extends ComponentProps<typeof SelectTrigger> {
  label?: React.ReactNode;
  errors?: string[];
}

export function FormSelectTrigger({ label, errors, ...props }: FormSelectTriggerProps) {
  return (
    <Label htmlFor={props.id} text={label}>
      <SelectTrigger
        {...props}
        className={cn(props.className, !!errors?.length && errorInputStyle)}
      />
      <FormError errors={errors} />
    </Label>
  );
}
