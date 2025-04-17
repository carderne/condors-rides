import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/db/zod";

function getInitials(user: User | null) {
  if (!user) {
    return "??";
  }
  const words = user.name.split(" ");
  const initials = words.map((w) => w.slice(0, 1));
  const res = initials.join("");
  return res;
}

export function UserAvatar({ user }: { user: User | null }) {
  return (
    <Avatar className="size-12 border-2 border-white">
      <AvatarImage src={user?.image ?? undefined} alt="user avatar" />
      <AvatarFallback className="bg-red-400 text-sm text-white">{getInitials(user)}</AvatarFallback>
    </Avatar>
  );
}
