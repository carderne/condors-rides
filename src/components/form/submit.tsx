"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

export function FormSubmit({ disabled, children, className, ...props }: ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return (
    <div className={cn("flex flex-row items-center justify-end", className)}>
      <Button type="submit" disabled={pending || disabled} {...props}>
        {pending ? <LoaderIcon className="animate-spin" /> : children}
      </Button>
    </div>
  );
}
