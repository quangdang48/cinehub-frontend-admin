import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ACCESS_TOKEN_EXPIRES_IN, API_URL, authConfig } from "@/config";
import type {
  ApiResponse,
} from "@/types/api";
import { api } from "@/lib/api-client";
import { LoginResponseDto, RefreshTokenResponseDto } from "./types";

function isTokenValid(token: any): token is { accessToken: string; accessTokenExpires: number; refreshToken: string } {
  return !!token.accessToken && !!token.accessTokenExpires && !!token.refreshToken;
}

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(API_URL + "/auth/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token.refreshToken,
      }),
    });
    const res = await response.json() as ApiResponse<RefreshTokenResponseDto>;
    return {
      ...token,
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRES_IN,
    };
  } catch (error) {
    return {
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
          const response = await api.post<ApiResponse<LoginResponseDto>>(
            "/auth/login",
            {
              email: credentials.email,
              password: credentials.password,
            }
          );
          const loginData = response.data;

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
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
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

      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      if (!isTokenValid(token)) {
        return {
          error: "TokenCorrupted",
        };
      }

      if (Date.now() < token.accessTokenExpires) {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.error === "TokenCorrupted" || token.error === "RefreshAccessTokenError") {
        session.error = token.error;
      }
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
