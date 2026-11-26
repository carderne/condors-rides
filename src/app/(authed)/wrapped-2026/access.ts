import type { User } from "@/db/zod";

// Wrapped is in preview: only visible to these users until launch.
const PREVIEW_EMAILS = ["chris@rdrn.me"];

export function canSeeWrapped(user: User | null): boolean {
  return !!user && PREVIEW_EMAILS.includes(user.email.toLowerCase());
}
