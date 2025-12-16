"use server";

import { signIn, signOut } from "@/modules/auth/auth";
import { AuthError } from "next-auth";
import type { AuthState } from "./types";

/**
 * Server action for user login
 */
export async function login(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const callbackUrl = formData.get("callbackUrl") as string || "/dashboard";

    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Email hoặc mật khẩu không đúng" };
        case "AccessDenied":
          return { success: false, error: "Bạn không có quyền truy cập trang quản trị" };
        default:
          return { success: false, error: "Đã xảy ra lỗi khi đăng nhập" };
      }
    }
    
    // If it's a redirect error (from successful login), rethrow it
    throw error;
  }
}

/**
 * Server action for user logout
 */
export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
