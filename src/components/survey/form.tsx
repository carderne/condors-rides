"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { H3, Lead } from "@/components/ui/typography";
import type { Survey } from "@/db/zod";
import Form from "next/form";
import { useActionState, useRef, useState } from "react";
import { toast } from "sonner";
import { action, undoAction } from "./actions";
import { type State, validator } from "./validate";

export function SurveyForm({ survey }: { survey: Survey }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [_, formAction] = useActionState<State, FormData>(
    async (prev, formData) => {
      const validated = validator(formData);
      if (validated.errors) {
        console.warn("Form validation errors", validated.errors);
        toast.error("Error with form!");
        return validated;
      }
      const res = await action(survey.id, prev, formData);
      toast.success("Thanks for your response!", {
        action: {
          label: "Changed your mind?",
          onClick: () => undoAction(survey.id),
        },
      });
      return res;
    },
    { errors: {} },
  );

  const triggerForm = () => {
    const form = formRef.current;
    if (!form) {
      return;
    }
    form.requestSubmit();
  };

  const handleOptionChange = (option: string, checked: boolean) => {
    if (survey.optionsExclusive) {
      setSelectedOptions(checked ? [option] : []);
    } else {
      setSelectedOptions((prev) =>
        checked ? [...prev, option] : prev.filter((item) => item !== option),
      );
    }
  };

  const handleRadioChange = (value: string) => {
    setSelectedOptions([value]);
    triggerForm();
  };

  return (
    <Form
      ref={formRef}
      className="border-primary space-y-4 rounded-xl border p-4 shadow"
      action={formAction}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <H3 className="text-primary">{survey.name}</H3>
          <Lead className="text-sm">{survey.description}</Lead>
        </div>
      </div>

      <div className="flex justify-between">
        {survey.options && survey.options.length > 0 && (
          <OptionWrapper
            optionsExclusive={survey.optionsExclusive}
            selectedOption={selectedOptions[0] ?? ""}
            handleRadioChange={handleRadioChange}
            className="flex flex-wrap gap-2"
          >
            <Input name="options" hidden={true} readOnly={true} value={selectedOptions.join(",")} />
            {survey.options.map((option, idx) => (
              <Label
                key={idx}
                className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 hover:cursor-pointer has-[[aria-checked=true]]:border-pink-600 has-[[aria-checked=true]]:bg-pink-50"
              >
                <OptionType
                  option={option}
                  optionsExclusive={survey.optionsExclusive}
                  selectedOptions={selectedOptions}
                  handleOptionChange={handleOptionChange}
                />
                <div className="text-sm leading-none font-medium">{option}</div>
              </Label>
            ))}
          </OptionWrapper>
        )}
      </div>
    </Form>
  );
}

function OptionWrapper({
  optionsExclusive,
  selectedOption,
  handleRadioChange,
  className,
  children,
}: {
  optionsExclusive: boolean;
  selectedOption: string;
  handleRadioChange: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  if (optionsExclusive) {
    return (
      <RadioGroup value={selectedOption} onValueChange={handleRadioChange} className={className}>
        {children}
      </RadioGroup>
    );
  }

  return <div className={className}>{children}</div>;
}

function OptionType({
  option,
  optionsExclusive,
  selectedOptions,
  handleOptionChange,
}: {
  option: string;
  optionsExclusive: boolean;
  selectedOptions: string[];
  handleOptionChange: (option: string, checked: boolean) => void;
}) {
  if (optionsExclusive) {
    return <RadioGroupItem value={option} id={option} className="border-primary text-primary" />;
  }

  return (
    <Checkbox
      className="data-[state=checked]:border-pink-600 data-[state=checked]:bg-pink-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
      checked={selectedOptions.includes(option)}
      onCheckedChange={(checked) => handleOptionChange(option, checked as boolean)}
    />
  );
}
