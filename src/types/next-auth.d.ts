import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      gender: string;
      avatarUrl?: string;
      role: "admin" | "user";
    } & DefaultSession["user"];
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: "RefreshAccessTokenError" | "TokenCorrupted";
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    gender: string;
    avatarUrl?: string;
    role: "admin" | "user";   
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name: string;
    gender: string;
    avatarUrl?: string;
    role: "admin" | "user";   
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: "RefreshAccessTokenError" | "TokenCorrupted";
  }
}
