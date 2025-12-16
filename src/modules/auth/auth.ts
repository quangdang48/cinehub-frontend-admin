import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/config";
import type {
  LoginResponseDto,
  RefreshTokenResponseDto,
  ApiResponse,
} from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Token expiration time (1 hour)
const ACCESS_TOKEN_EXPIRES_IN = 60 * 60 * 1000;

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("RefreshAccessTokenError");
    }

    const data: ApiResponse<RefreshTokenResponseDto> = await response.json();
    const refreshedTokens = data.data;

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRES_IN,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError" as const,
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Invalid credentials");
          }

          const data: ApiResponse<LoginResponseDto> = await response.json();
          const loginData = data.data;

          return {
            id: loginData.user.id,
            email: loginData.user.email,
            name: loginData.user.name,
            gender: loginData.user.gender,
            role: loginData.user.role,
            accessToken: loginData.accessToken,
            refreshToken: loginData.refreshToken,
            accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRES_IN,
          };
        } catch (error) {
          console.log("Login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          gender: user.gender,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      // Handle session update
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      // Return previous token if not expired
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

    //   // Token expired, try to refresh
    //   return refreshAccessToken(token);
    // Token expired, log out user
      return {}
    },
    async session({ session, token }) {
      // Handle refresh token error
      if (token.error === "RefreshAccessTokenError") {
        session.error = "RefreshAccessTokenError";
      }

      // Expose user data and tokens to session
      session.user = {
        ...session.user,
        id: token.id,
        email: token.email,
        name: token.name,
        gender: token.gender,
        role: token.role,
      };
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpires = token.accessTokenExpires;

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
