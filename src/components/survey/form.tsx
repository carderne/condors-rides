"use client";

import { FormSubmit } from "@/components/form/submit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { H3, Lead } from "@/components/ui/typography";
import type { Survey } from "@/db/zod";
import { MessageSquareIcon } from "lucide-react";
import Form from "next/form";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import { action, undoAction } from "./actions";
import { type State, validator } from "./validate";

export function SurveyForm({ survey }: { survey: Survey }) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);

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
  };

  return (
    <Form className="border-primary space-y-4 rounded-xl border p-4 shadow" action={formAction}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <H3 className="text-primary">{survey.name}</H3>
          <Lead className="text-sm">{survey.description}</Lead>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {survey.allowComment && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowComment(!showComment)}
            >
              <MessageSquareIcon />
              {showComment ? "Hide comment" : "Add comment"}
            </Button>
          )}
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
        <FormSubmit>Submit</FormSubmit>
      </div>

      {survey.allowComment && showComment && (
        <div className="animate-in slide-in-from-top-2 flex gap-2 duration-200">
          <Textarea
            name="comment"
            placeholder="Share your thoughts..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      )}
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
