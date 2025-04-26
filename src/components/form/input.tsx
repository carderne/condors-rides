import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { errorInputStyle, FormError } from "./error";

interface FormInputProps extends ComponentProps<"input"> {
  label?: React.ReactNode;
  labelSuffix?: React.ReactNode;
  errors?: string[];
}

export function FormInput({ label, labelSuffix, errors, ...props }: FormInputProps) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col items-center gap-1 md:flex-row md:gap-4">
        <Label
          htmlFor={props.name}
          className="mb-0 flex flex-row items-center gap-2 text-xl md:w-32 md:flex-col md:gap-0"
        >
          <span>{label}</span>
          <span className="!text-sm italic">{labelSuffix}</span>
        </Label>
        <Input
          {...props}
          id={props.name}
          className={cn("h-20 p-4 !text-xl", props.className, !!errors?.length && errorInputStyle)}
        />
      </div>
      <div className="md:ml-32">
        <FormError errors={errors} />
      </div>
    </div>
  );
}
