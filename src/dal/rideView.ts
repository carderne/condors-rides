import { db, schema } from "@/db";
import { getMembership } from "./membership";

export async function viewedRide(rideId: string) {
  const user = await getMembership();
  const viewedAt = new Date();
  await db
    .insert(schema.rideView)
    .values({
      userId: user.id,
      rideId,
      viewedAt,
    })
    .onConflictDoUpdate({
      target: [schema.rideView.userId, schema.rideView.rideId],
      set: { viewedAt },
    });
}
