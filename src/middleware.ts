import { NextResponse, type NextRequest } from "next/server";
/* Canonical path redirects, preserving search parameters. Do not rewrite
   hyphenated project identifiers. Host-level old-site redirects require a
   separate Cloudflare Worker on that account and are documented as TODO. */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const normalized = (path.replace(/\/+$/, "") || "/").toLowerCase();
  if (path !== normalized) {
    const target = request.nextUrl.clone();
    target.pathname = normalized;
    return NextResponse.redirect(target, 301);
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next|assets|favicon.ico|robots.txt|sitemap.xml).*)"],
};
