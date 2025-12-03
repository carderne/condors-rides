// useful resource:
// https://www.propelauth.com/post/getting-url-in-next-server-components
// https://github.com/vercel/next.js/issues/43704

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Found this very specific incantation here:
  // https://github.com/vercel/next.js/issues/50659#issuecomment-2408602781
  // Following the standard advice from the link at the top broke the return value
  // from server actions...
  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  response.headers.set("x-current-path", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
