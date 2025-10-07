import type * as schema from "./schema";

export type User = typeof schema.user.$inferSelect;

export type Ride = typeof schema.ride.$inferSelect;
export type InsertRide = typeof schema.ride.$inferInsert;

export type RideMember = typeof schema.rideMember.$inferSelect;

export type Route = typeof schema.route.$inferSelect;

export type Comment = typeof schema.comment.$inferSelect;
export type CommentReaction = typeof schema.commentReaction.$inferSelect;
export type CommentReactionHydrated = CommentReaction & { user: User };

export type Sub = typeof schema.sub.$inferSelect;
