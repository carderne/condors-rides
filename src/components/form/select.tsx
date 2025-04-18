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
    <div className="row flex flex-col items-center gap-1 md:flex md:flex-row md:gap-4">
      <Label htmlFor={props.name} className="mb-0 flex items-center text-xl md:w-32">
        {label}
      </Label>
      <SelectTrigger
        {...props}
        id={props.name}
        className={cn(
          "!h-20 w-full p-4 !text-xl",
          props.className,
          !!errors?.length && errorInputStyle,
        )}
      />
      <FormError errors={errors} />
    </div>
  );
}
