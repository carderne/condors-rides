import { headers } from "next/headers";

export async function getPathOnServer(): Promise<string> {
  const headerList = await headers();
  // this header is injected in the middleware.ts
  const pathname = headerList.get("x-current-path");
  if (!pathname) {
    // Ideally this should never happen, but Nextjs middleware is a bit weird
    // and we had occassional errors with an invariant here, so being safer.
    // This is only used for login redirect, so worst case they don't land on their
    // desired page (better than just an error).
    return "/";
  }
  return pathname;
}
