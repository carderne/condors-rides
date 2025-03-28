"use server";

import { db, schema } from "@/db";
import type { User } from "@/db/zod";
import { revalidatePath } from "next/cache";

export async function joinRideAction(rideId: string, formData: FormData, currentUser: User | null) {
  try {
    // Prepare the member data
    const memberData = {
      rideId: rideId,
      userId: currentUser?.id || null,
      name: currentUser ? currentUser.name : (formData.get("name") as string),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert the new member
    await db.insert(schema.rideMember).values(memberData);

    // Revalidate the page to show the updated list
    revalidatePath(`/rides/${rideId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to join ride:", error);
    throw new Error("Failed to join the ride. Please try again.");
  }
}
