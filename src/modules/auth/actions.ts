"use server";

import { signIn, signOut } from "@/modules/auth/auth";
import { AuthError } from "next-auth";
import type { AuthState, ChangePasswordDto, UpdateProfileDto, UserDto } from "./types";
import { api, getAuthHeaders } from "@/lib/api-client";
import { ApiError, ApiResponse } from "@/types/api";
import { revalidatePath } from "next/cache";
import { API_URL } from "@/config/config";

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

export async function updateProfile(id: string, formData: FormData) {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: authHeaders,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message);
  }

  revalidatePath("/profile");
  return data.data;
}

export async function changePassword(data: ChangePasswordDto) {
  await api.post("/auth/change-password", data);
}
