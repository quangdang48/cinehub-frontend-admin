"use client";

import React, { createContext, useContext, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSSE, type SSENotification } from "@/hooks/use-sse";
import { API_URL } from "@/config";

interface NotificationContextType {
    isConnected: boolean;
    clientId: string | null;
    notifications: SSENotification[];
    unreadCount: number;
    connect: () => void;
    disconnect: () => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
    children: React.ReactNode;
    sseUrl?: string;
}

export function NotificationProvider({
    children,
    sseUrl = `${API_URL}/admin/notifications/subscribe`,
}: NotificationProviderProps) {
    const { data: session } = useSession();

    const handleNotification = useCallback((notification: SSENotification) => {
        // Show toast for new notifications
        const toastOptions = {
            description: notification.message || notification.content,
            duration: 5000,
        };

        switch (notification.type) {
            case "success":
                toast.success(notification.title || "Thông báo", toastOptions);
                break;
            case "warning":
                toast.warning(notification.title || "Cảnh báo", toastOptions);
                break;
            case "error":
                toast.error(notification.title || "Lỗi", toastOptions);
                break;
            // Admin subscription notifications
            case "admin.user_subscribed":
                toast.success(notification.title || "🎉 Đăng ký mới!", {
                    ...toastOptions,
                    duration: 8000,
                });
                break;
            case "admin.user_unsubscribed":
                toast.warning(notification.title || "⚠️ Hủy đăng ký", {
                    ...toastOptions,
                    duration: 8000,
                });
                break;
            case "admin.payment_received":
                toast.success(notification.title || "💰 Thanh toán mới!", {
                    ...toastOptions,
                    duration: 6000,
                });
                break;
            case "admin.payment_failed":
                toast.error(notification.title || "❌ Thanh toán thất bại", {
                    ...toastOptions,
                    duration: 8000,
                });
                break;
            default:
                toast.info(notification.title || "Thông báo", toastOptions);
        }
    }, []);

    const handleConnect = useCallback((clientId: string) => {
        console.log("SSE Connected with client ID:", clientId);
    }, []);

    const handleError = useCallback((error: Event) => {
        console.error("SSE Connection error:", error);
    }, []);

    const {
        isConnected,
        clientId,
        notifications,
        unreadCount,
        connect,
        disconnect,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        setInitialNotifications,
    } = useSSE({
        url: sseUrl,
        autoConnect: true,
        onNotification: handleNotification,
        onConnect: handleConnect,
        onError: handleError,
    });

    // Fetch notification history from API
    const fetchNotificationHistory = useCallback(async (forceRefresh = false) => {
        if (!session?.accessToken) {
            console.log("No access token available for fetching notifications");
            return;
        }

        try {
            console.log("Fetching notification history...", { forceRefresh });
            const response = await fetch(
                `${API_URL}/admin/notifications/history?page=1&limit=20`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                }
            );

            console.log("Notification history response status:", response.status);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result = await response.json();
            console.log("Notification history result:", result);
            
            // Handle nested data structure: result.data can be array or { data: [], meta: {} }
            let historyData: unknown[] = [];
            if (Array.isArray(result.data)) {
                historyData = result.data;
            } else if (result.data && Array.isArray(result.data.data)) {
                historyData = result.data.data;
            } else if (result.data && typeof result.data === 'object') {
                // If data is object but not array, try to get nested data
                historyData = result.data.data || [];
            }

            console.log("Extracted historyData:", historyData);

            // Transform history data to SSENotification format
            const transformedNotifications: SSENotification[] = historyData.map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (item: any) => ({
                    id: item.id,
                    type: item.type || "info",
                    title: item.title,
                    message: item.message || item.content,
                    content: item.message || item.content,
                    timestamp: item.createdAt || new Date().toISOString(),
                    read: true, // Historical notifications are marked as read
                    metadata: item.metadata,
                })
            );

            console.log("Transformed notifications:", transformedNotifications.length);
            setInitialNotifications(transformedNotifications, forceRefresh);
        } catch (error) {
            console.error("Failed to fetch notification history:", error);
        }
    }, [session?.accessToken, setInitialNotifications]);

    // Load notification history when session is available
    useEffect(() => {
        if (session?.accessToken) {
            fetchNotificationHistory(false);
        }
    }, [session?.accessToken, fetchNotificationHistory]);

    // Create a refresh function that forces update
    const refreshNotifications = useCallback(async () => {
        await fetchNotificationHistory(true);
    }, [fetchNotificationHistory]);

    return (
        <NotificationContext.Provider
            value={{
                isConnected,
                clientId,
                notifications,
                unreadCount,
                connect,
                disconnect,
                markAsRead,
                markAllAsRead,
                clearNotifications,
                refreshNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
