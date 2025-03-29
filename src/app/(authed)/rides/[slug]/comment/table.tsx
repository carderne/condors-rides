"use client";

import { CommentCard } from "./comment";
import { useOptimisticContext } from "./optimistic";

export function CommentsList({ userId }: { userId: string }) {
  const { optimistic: comments } = useOptimisticContext();
  return (
    <div className="flex flex-col gap-8">
      {comments.map((comment) => (
        <CommentCard key={comment.id} userId={userId} comment={comment} />
      ))}
    </div>
  );
}
