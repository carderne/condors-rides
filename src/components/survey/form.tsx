"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { H3, Lead } from "@/components/ui/typography";
import type { Survey } from "@/db/zod";
import { toast } from "sonner";
import { action, undoAction } from "./actions";

export function SurveyForm({ survey }: { survey: Survey }) {
  const submit = async (option: string) => {
    await action(survey.id, option);
    toast.success("Thanks for your response!", {
      action: {
        label: "Changed your mind?",
        onClick: () => undoAction(survey.id),
      },
    });
  };

  return (
    <div className="border-primary space-y-4 rounded-xl border p-4 shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <H3 className="text-primary">{survey.name}</H3>
          <Lead className="text-sm">{survey.description}</Lead>
        </div>
      </div>

      <div className="flex justify-between">
        {survey.options && survey.options.length > 0 && (
          <RadioGroup className="flex flex-wrap gap-2" onValueChange={submit}>
            {survey.options.map((option, idx) => (
              <Label
                key={idx}
                className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 hover:cursor-pointer has-[[aria-checked=true]]:border-pink-600 has-[[aria-checked=true]]:bg-pink-50"
              >
                <RadioGroupItem
                  value={option}
                  id={option}
                  className="border-primary text-primary cursor-pointer"
                />
                <div className="text-sm leading-none font-medium">{option}</div>
              </Label>
            ))}
          </RadioGroup>
        )}
      </div>
    </div>
  );
}
