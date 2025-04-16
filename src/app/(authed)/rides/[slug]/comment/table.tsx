"use client";

import { CommentCard } from "./comment";
import { useOptimisticContext } from "./optimistic";

export function CommentsList({ userId, admin }: { userId: string; admin: boolean }) {
  const { optimistic: comments } = useOptimisticContext();
  return (
    <div className="flex flex-col gap-8">
      {comments.map((comment) => (
        <CommentCard key={comment.id} userId={userId} comment={comment} admin={admin} />
      ))}
    </div>
  );
}
