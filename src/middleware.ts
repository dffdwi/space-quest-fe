import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/register"];

const guestOnlyPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedInCookie = request.cookies.get("isLoggedIn")?.value;
  const isAuthenticated = isLoggedInCookie === "true";

  if (!publicPaths.includes(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (guestOnlyPaths.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|logo.svg).*)"],
};
