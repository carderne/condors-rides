import { createInsertSchema } from "drizzle-zod";

import * as schema from "./schema";

export type User = typeof schema.user.$inferSelect;

export const insertRide = createInsertSchema(schema.ride);
export type Ride = typeof schema.ride.$inferSelect;

export const insertRideMember = createInsertSchema(schema.rideMember);
export type RideMember = typeof schema.rideMember.$inferSelect;

export type Comment = typeof schema.comment.$inferSelect;
export type CommentReaction = typeof schema.commentReaction.$inferSelect;
