"use server";

import { auth } from "@/modules/auth/auth";
import { ADMIN_API_URL } from "@/config";
import { SendNotificationRequest } from "./types";

export async function sendNotification(data: SendNotificationRequest) {
  try {
    const session = await auth();
    const token = session?.accessToken;

    const response = await fetch(`${ADMIN_API_URL}/notifications/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return { success: true, message: "Gửi thông báo thành công" };
  } catch (error) {
    console.error("Failed to send notification:", error);
    // Return error message from backend if available
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: "Gửi thông báo thất bại" };
  }
}

export async function broadcastNotification(data: Omit<SendNotificationRequest, "userId">) {
  try {
    const session = await auth();
    const token = session?.accessToken;

    const response = await fetch(`${ADMIN_API_URL}/notifications/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return { success: true, message: "Broadcast thành công" };
  } catch (error) {
    console.error("Failed to broadcast notification:", error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: "Broadcast thất bại" };
  }
}
