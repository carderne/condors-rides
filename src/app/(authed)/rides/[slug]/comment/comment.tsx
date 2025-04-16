import { Button } from "@/components/ui/button";
import type { CommentHydrated } from "@/dal/comments";
import { formatDistanceToNow } from "date-fns";
import { Clock, PlusIcon, TrashIcon } from "lucide-react";
import { deleteCommentAction, upvoteCommentAction } from "./actions";

export function CommentCard({
  userId,
  comment,
  admin,
}: {
  userId: string;
  comment: CommentHydrated;
  admin: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-muted-foreground flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span>{comment.user.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{formatDistanceToNow(comment.createdAt, { addSuffix: true })}</span>
        </div>
        <Button
          variant="ghost"
          className="bg-accent hover:bg-primary-hover hover:text-background flex !size-5 w-fit px-6"
          onClick={upvoteCommentAction.bind(null, comment.id)}
        >
          <PlusIcon className="!size-3" strokeWidth={1} />
          <span>{comment.reactions.length}</span>
        </Button>
        {(userId === comment.userId || admin) && (
          <Button
            variant="ghost"
            size="icon"
            className="bg-accent hover:bg-primary-hover hover:text-background flex !size-5"
            onClick={deleteCommentAction.bind(null, comment.id)}
          >
            <TrashIcon className="!size-3" strokeWidth={1} />
          </Button>
        )}
      </div>
      <div className="text-sm">{comment.text}</div>
    </div>
  );
}
