"use client";

import { useState } from "react";
import { Bell, CheckCheck, Trash2, Circle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/providers/notification-provider";
import type { SSENotification } from "@/hooks/use-sse";

function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
}

function getNotificationIcon(type: SSENotification["type"]) {
    const iconClass = cn("h-2 w-2 rounded-full");
    switch (type) {
        case "success":
            return <Circle className={cn(iconClass, "fill-green-500 text-green-500")} />;
        case "warning":
            return <Circle className={cn(iconClass, "fill-yellow-500 text-yellow-500")} />;
        case "error":
            return <Circle className={cn(iconClass, "fill-red-500 text-red-500")} />;
        default:
            return <Circle className={cn(iconClass, "fill-blue-500 text-blue-500")} />;
    }
}

function NotificationItem({
    notification,
    onRead,
}: {
    notification: SSENotification;
    onRead: (id: string) => void;
}) {
    return (
        <div
            className={cn(
                "flex gap-3 p-3 cursor-pointer hover:bg-accent rounded-lg transition-colors",
                !notification.read && "bg-accent/50"
            )}
            onClick={() => onRead(notification.id)}
        >
            <div className="mt-1.5">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                    {notification.title || "Thông báo"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message || notification.content}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(notification.timestamp)}
                </p>
            </div>
            {!notification.read && (
                <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
            )}
        </div>
    );
}

export function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const {
        isConnected,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
    } = useNotifications();

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                    {/* Connection indicator */}
                    <span
                        className={cn(
                            "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background",
                            isConnected ? "bg-green-500" : "bg-red-500"
                        )}
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">Thông báo</h4>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {unreadCount} mới
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                    e.preventDefault();
                                    markAllAsRead();
                                }}
                                title="Đánh dấu tất cả đã đọc"
                            >
                                <CheckCheck className="h-4 w-4" />
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                    e.preventDefault();
                                    clearNotifications();
                                }}
                                title="Xóa tất cả"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notification List */}
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                            <Bell className="h-10 w-10 mb-2 opacity-50" />
                            <p className="text-sm">Không có thông báo</p>
                        </div>
                    ) : (
                        <div className="p-1">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={markAsRead}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <DropdownMenuSeparator />
                <div className="p-2">
                    <Button variant="ghost" className="w-full text-sm" size="sm">
                        Xem tất cả thông báo
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
