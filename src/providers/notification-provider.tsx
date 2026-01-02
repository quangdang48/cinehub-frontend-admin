"use client";

import React, { createContext, useContext, useCallback } from "react";
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
    } = useSSE({
        url: sseUrl,
        autoConnect: true,
        onNotification: handleNotification,
        onConnect: handleConnect,
        onError: handleError,
    });

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
