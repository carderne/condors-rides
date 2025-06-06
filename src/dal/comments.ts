import type { Comment, CommentReactionHydrated, User } from "@/db/zod";

export type CommentHydrated = Comment & { user: User; reactions: CommentReactionHydrated[] };
