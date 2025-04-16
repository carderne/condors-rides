import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { errorInputStyle, FormError } from "./error";

interface FormInputProps extends ComponentProps<typeof Switch> {
  label?: React.ReactNode;
  errors?: string[];
}

export function FormSwitch({ label, errors, ...props }: FormInputProps) {
  return (
    <div>
      <Label htmlFor={props.id} text={label}>
        <Switch {...props} className={cn(props.className, !!errors?.length && errorInputStyle)} />
      </Label>
      <FormError errors={errors} />
    </div>
  );
}
