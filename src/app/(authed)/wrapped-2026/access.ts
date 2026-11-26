import type { User } from "@/db/zod";

// Wrapped is open to all members. Keep this as the single gate so it's easy
// to restrict again (e.g. an email allowlist) if needed.
export function canSeeWrapped(user: User | null): user is User {
  return !!user;
}
