// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Daftar path yang dianggap publik (tidak memerlukan autentikasi)
const publicPaths = ["/login", "/register"];

// Daftar path yang hanya untuk tamu (pengguna yang belum login)
// Jika user sudah login dan mencoba akses path ini, akan diredirect ke home
const guestOnlyPaths = ["/login", "/register"];

// Daftar path yang memerlukan autentikasi
// Semua path lain yang tidak ada di publicPaths secara implisit dianggap privat
// Namun, kita bisa definisikan secara eksplisit jika perlu matcher yang lebih kompleks

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedInCookie = request.cookies.get("isLoggedIn")?.value;
  const isAuthenticated = isLoggedInCookie === "true";

  // Logika redirect sama seperti di atas...
  if (!publicPaths.includes(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (guestOnlyPaths.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

// Konfigurasi matcher untuk menentukan path mana saja yang akan dijalankan oleh middleware
export const config = {
  matcher: [
    /*
     * Cocokkan semua path request kecuali untuk:
     * - Path API (_next/static, _next/image, api/, favicon.ico)
     * - Ini untuk menghindari middleware berjalan pada aset statis dan rute API.
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
