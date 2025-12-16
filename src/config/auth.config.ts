import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Protected admin routes
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
        return false;
      }

      // Redirect to dashboard if logged in user tries to access auth routes
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Configured in auth.ts
};
