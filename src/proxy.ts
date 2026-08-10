/**
 * Next.js 16 Proxy (formerly Middleware)
 *
 * In Next.js 16, "middleware" was renamed to "proxy".
 * This file must be named proxy.ts and export a function named `proxy`.
 *
 * NextAuth v5's `auth` handler is used here to protect app routes.
 * The /api/auth/* paths are intentionally EXCLUDED from the matcher so
 * NextAuth handles those routes itself (session, signIn, signOut, etc.).
 */
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Run the NextAuth session check
  const session = await auth();

  const { pathname } = request.nextUrl;

  // Protected routes — redirect to login if not authenticated
  const protectedPrefixes = ["/admin", "/partner", "/dashboard"];
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - /api/auth/* (NextAuth internal endpoints — must never be intercepted)
     *  - /_next/* (Next.js internals / static assets)
     *  - Files with an extension (e.g. favicon.ico, logo.png)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
