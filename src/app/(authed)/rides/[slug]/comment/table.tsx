"use client";

import { Comment } from "./comment";
import { useOptimisticContext } from "./optimistic";

export function CommentsList({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  const { optimistic: comments } = useOptimisticContext();
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} userId={userId} isAdmin={isAdmin} />
      ))}
    </div>
  );
}
