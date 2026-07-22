// useful resource:
// https://www.propelauth.com/post/getting-url-in-next-server-components
// https://github.com/vercel/next.js/issues/43704

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// User-agents used by social platforms / chat apps when they unfurl a link.
// These crawlers are unauthenticated, so they'd normally just get bounced to
// /sign-in and see nothing useful. Instead we serve them a public preview page
// with rich Open Graph metadata + a map image.
const CRAWLER_UA =
  /facebookexternalhit|facebookcatalog|whatsapp|twitterbot|slackbot|slack-imgproxy|discordbot|telegrambot|linkedinbot|pinterest|redditbot|skypeuripreview|googlebot|bingbot|embedly|iframely|vkshare|opengraph|preview|bot\b/i;

// Paths under /rides that are real routes, not ride slugs.
const RESERVED_RIDE_PATHS = new Set(["upcoming", "future", "recent", "joined", "archive"]);

export function proxy(request: NextRequest) {
  const rewrite = crawlerRewrite(request);
  if (rewrite) {
    return rewrite;
  }

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

// When a social crawler requests a ride page, rewrite it to the public preview
// route so it gets Open Graph metadata + a map image instead of the sign-in page.
function crawlerRewrite(request: NextRequest): NextResponse | null {
  const match = request.nextUrl.pathname.match(/^\/rides\/([^/]+)\/?$/);
  if (!match) {
    return null;
  }

  const slug = decodeURIComponent(match[1]!);
  if (RESERVED_RIDE_PATHS.has(slug)) {
    return null;
  }

  const ua = request.headers.get("user-agent") ?? "";
  if (!CRAWLER_UA.test(ua)) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/preview/rides/${slug}`;
  return NextResponse.rewrite(url);
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
