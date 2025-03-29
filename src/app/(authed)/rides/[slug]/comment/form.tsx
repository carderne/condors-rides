"use client";

import { FormError } from "@/components/form/error";
import { FormSubmit } from "@/components/form/submit";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/db/zod";
import Form from "next/form";
import { useActionState, useRef } from "react";
import { action } from "./actions";
import { useOptimisticContext } from "./optimistic";
import { validator, type State } from "./validate";

export function NewCommentForm({ rideId, user }: { rideId: string; user: User }) {
  const ref = useRef<HTMLFormElement>(null);
  const { addOptimistic } = useOptimisticContext();
  const [state, formAction] = useActionState<State, FormData>(
    async (prev, formData) => {
      const validated = validator(formData);
      if (validated.errors) return validated;
      const res = await action(rideId, prev, formData);
      return res;
    },
    { errors: {} },
  );
  const optimisticAction = (formData: FormData) => {
    const data = {
      id: "new",
      text: formData.get("text") as string,
      updatedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      rideId,
      user,
      userId: user.id,
      reactions: [],
    };
    addOptimistic(data);
    ref.current?.reset();
    formAction(formData);
  };
  return (
    <Form ref={ref} className="flex flex-col gap-2" action={optimisticAction}>
      <FormError errors={state.errors?.text} />
      <Textarea
        name="text"
        placeholder="Add a comment..."
        defaultValue={(state.formData?.get("text") as string) || ""}
        required={true}
        className="min-h-[80px]"
      />
      <FormSubmit>Add Comment</FormSubmit>
    </Form>
  );
}
