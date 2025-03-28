"use client";

import { FormInput } from "@/components/form/input";
import { FormSubmit } from "@/components/form/submit";
import type { User } from "@/db/zod";
import Form from "next/form";
import { useActionState } from "react";
import { joinRideAction } from "./actions";

interface JoinRideFormProps {
  rideId: string;
  currentUser: User | null;
}

interface JoinFormState {
  errors?: {
    name?: string[];
  };
  success?: boolean;
}

export function JoinRideForm({ rideId, currentUser }: JoinRideFormProps) {
  const [state, formAction] = useActionState<JoinFormState, FormData>(
    async (_prev, formData) => {
      if (!currentUser && !formData.get("name")) {
        return { errors: { name: ["Please enter your name"] } };
      }

      try {
        await joinRideAction(rideId, formData, currentUser);
        return { success: true };
      } catch (error) {
        return {
          errors: {
            name: [(error as Error).message || "Failed to join ride"],
          },
        };
      }
    },
    { errors: {} },
  );

  if (state.success) {
    return (
      <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700">
        <p className="font-medium">Success!</p>
        <p>You have successfully joined this ride.</p>
      </div>
    );
  }

  return (
    <Form action={formAction} className="space-y-4">
      {!currentUser && (
        <FormInput
          required={true}
          name="name"
          label="Your Name"
          placeholder="Enter your name"
          errors={state.errors?.name}
        />
      )}

      <FormSubmit className="mt-4 w-full">
        {currentUser ? "Join Ride" : "Sign Up as Guest"}
      </FormSubmit>
    </Form>
  );
}
