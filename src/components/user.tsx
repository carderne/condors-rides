import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/db/zod";
import { cn } from "@/lib/utils";

function getInitials(user: User | null) {
  if (!user) {
    return "??";
  }
  const words = user.name.split(" ");
  const initials = words.map((w) => w.slice(0, 1));
  const res = initials.join("");
  return res;
}

export function UserAvatar({ user, className }: { user: User | null; className?: string }) {
  return (
    <Avatar className={cn("size-12 rounded-full border-2 border-pink-200", className)}>
      <AvatarImage src={user?.image ?? undefined} alt="user avatar" />
      <AvatarFallback className="text-md text-primary bg-white font-bold">
        {getInitials(user)}
      </AvatarFallback>
    </Avatar>
  );
}
