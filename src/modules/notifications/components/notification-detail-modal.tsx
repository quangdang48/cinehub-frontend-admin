"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { User, Users, Radio, Calendar, Tag, FileText, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Notification, NotificationType } from "../types";

interface NotificationDetailModalProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_CONFIG: Record<NotificationType, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  info: { label: "Thông tin", variant: "default", className: "bg-blue-500" },
  success: { label: "Thành công", variant: "secondary", className: "bg-green-500 text-white" },
  warning: { label: "Cảnh báo", variant: "secondary", className: "bg-yellow-500 text-black" },
  error: { label: "Lỗi", variant: "destructive" },
};

const TARGET_TYPE_CONFIG = {
  broadcast: { label: "Broadcast (Tất cả)", icon: Radio, color: "text-purple-500" },
  single: { label: "Cá nhân", icon: User, color: "text-blue-500" },
  group: { label: "Nhóm", icon: Users, color: "text-green-500" },
};

export function NotificationDetailModal({
  notification,
  open,
  onOpenChange,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  const typeConfig = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
  const targetConfig = TARGET_TYPE_CONFIG[notification.targetType] || TARGET_TYPE_CONFIG.broadcast;
  const TargetIcon = targetConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chi tiết thông báo
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tiêu đề</label>
              <p className="text-lg font-semibold">{notification.title}</p>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nội dung</label>
              <div className="rounded-md bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-sm">{notification.message}</p>
              </div>
            </div>

            <Separator />

            {/* Type & Target Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Loại thông báo
                </label>
                <Badge variant={typeConfig.variant} className={typeConfig.className}>
                  {typeConfig.label}
                </Badge>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <TargetIcon className="h-4 w-4" />
                  Đối tượng
                </label>
                <div className={`flex items-center gap-1 font-medium ${targetConfig.color}`}>
                  <TargetIcon className="h-4 w-4" />
                  {targetConfig.label}
                </div>
              </div>
            </div>

            {/* Target Users */}
            {notification.targetType !== 'broadcast' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Người nhận ({notification.targetUsers?.length || (notification.targetUser ? 1 : 0)})
                </label>
                <div className="flex flex-wrap gap-2">
                  {notification.targetUsers?.map((user) => (
                    <Badge key={user.id} variant="outline" className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {user.name || user.email}
                    </Badge>
                  ))}
                  {!notification.targetUsers?.length && notification.targetUser && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {notification.targetUser.name || notification.targetUser.email}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Sender & Created At */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Người gửi
                </label>
                <p className="text-sm">
                  {notification.sender?.name || "Admin"}
                  {notification.sender?.email && (
                    <span className="text-muted-foreground block text-xs">
                      {notification.sender.email}
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Thời gian gửi
                </label>
                <p className="text-sm">
                  {format(new Date(notification.createdAt), "HH:mm:ss", { locale: vi })}
                  <span className="text-muted-foreground block text-xs">
                    {format(new Date(notification.createdAt), "dd/MM/yyyy", { locale: vi })}
                  </span>
                </p>
              </div>
            </div>

            {/* Metadata */}
            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                    <Info className="h-4 w-4" />
                    Metadata
                  </label>
                  <pre className="rounded-md bg-muted/50 p-4 text-xs overflow-auto">
                    {JSON.stringify(notification.metadata, null, 2)}
                  </pre>
                </div>
              </>
            )}

            {/* ID */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">ID</label>
              <p className="font-mono text-xs text-muted-foreground">{notification.id}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
