import type { Comment, CommentReaction, User } from "@/db/zod";

export type CommentHydrated = Comment & { user: User; reactions: CommentReaction[] };
