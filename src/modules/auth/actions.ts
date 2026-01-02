"use server";

import { signIn, signOut } from "@/modules/auth/auth";
import { AuthError } from "next-auth";
import type { AuthState, ChangePasswordDto, UpdateProfileDto, UserDto } from "./types";
import { api } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { revalidatePath } from "next/cache";

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

export async function getProfile() {
  const response = await api.post<ApiResponse<UserDto>>("/auth/my-info");
  return response.data;
}

export async function updateProfile(id: string, data: UpdateProfileDto) {
  const response = await api.put<ApiResponse<UserDto>>(`/users/${id}`, data);
  revalidatePath("/profile");
  return response.data;
}

export async function changePassword(data: ChangePasswordDto) {
  await api.post("/auth/change-password", data);
}
