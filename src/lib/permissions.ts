import type { User } from "@/db/zod";

export function checkIsAdmin(user: User): boolean {
  return user.type === "admin";
}
