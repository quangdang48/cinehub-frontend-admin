import { auth } from "@/modules/auth"
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Check if token has refresh error - force logout
  if (req.auth?.error === "RefreshAccessTokenError" || req.auth?.error === "TokenCorrupted") {
    const response = NextResponse.redirect(new URL("/login", nextUrl));
    // Clear session cookies
    response.cookies.delete("authjs.session-token");
    response.cookies.delete("__Secure-authjs.session-token");
    return response;
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/movies",
    "/users",
    "/categories",
    "/genres",
    "/banners",
    "/plans",
    "/transactions",
    "/comments",
    "/reports",
    "/settings",
  ];

  // Auth routes (login, forgot-password)
  const authRoutes = ["/login", "/forgot-password"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // Redirect to dashboard if logged in user tries to access auth routes
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirect root to dashboard if logged in, otherwise to login
  if (nextUrl.pathname === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
