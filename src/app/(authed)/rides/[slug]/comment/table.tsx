"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user";
import { formatShortDateTime } from "@/lib/fmt";
import { cn } from "@/lib/utils";
import { ThumbsUpIcon, Trash2Icon } from "lucide-react";
import { deleteCommentAction, toggleUpvoteCommentAction } from "./actions";
import { useOptimisticContext } from "./optimistic";

export function CommentsList({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  const { optimistic: comments } = useOptimisticContext();
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0">
          <div className="mb-3 flex justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar user={comment.user} />
              <div>
                <div className="font-medium text-gray-800">{comment.user.name}</div>
                <div className="text-xs text-gray-500">
                  {formatShortDateTime(comment.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 text-gray-500 hover:text-pink-600",
                  comment.reactions.some((r) => r.userId === userId) && "text-pink-600",
                )}
                onClick={toggleUpvoteCommentAction.bind(null, comment.id)}
              >
                <ThumbsUpIcon className="mr-1 h-4 w-4" />
                <span>{comment.reactions.length}</span>
              </Button>
              {(comment.userId == userId || isAdmin) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-gray-500 hover:text-red-600"
                  onClick={deleteCommentAction.bind(null, comment.id)}
                >
                  <Trash2Icon className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          </div>
          <p className="text-gray-700">{comment.text}</p>
        </div>
      ))}
    </div>
  );
}
