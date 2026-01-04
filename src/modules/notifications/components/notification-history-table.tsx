"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { MoreHorizontal, Eye, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Notification } from "../types";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { NotificationDetailModal } from "./notification-detail-modal";
import { ResendNotificationModal } from "./resend-notification-modal";
import { deleteNotification } from "../actions";

interface NotificationHistoryTableProps {
  data: Notification[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function NotificationHistoryTable({
  data,
  totalPages,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: NotificationHistoryTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Modal states
  const [detailNotification, setDetailNotification] = useState<Notification | null>(null);
  const [resendNotification, setResendNotification] = useState<Notification | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);

  const handleDelete = async () => {
    if (!notificationToDelete) return;

    startTransition(async () => {
      const result = await deleteNotification(notificationToDelete.id);
      
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
      
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    });
  };

  const columns: Column<Notification>[] = [
    {
      key: "title",
      title: "Tiêu đề",
      render: (item) => <span className="font-medium">{item.title}</span>,
    },
    {
      key: "message",
      title: "Nội dung",
      render: (item) => (
        <span className="line-clamp-2 max-w-75" title={item.message}>
          {item.message}
        </span>
      ),
    },
    {
      key: "type",
      title: "Loại",
      render: (item) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          info: "default",
          success: "secondary",
          warning: "secondary",
          error: "destructive",
        };
        return <Badge variant={variants[item.type] || "outline"}>{item.type}</Badge>;
      },
    },
    {
      key: "targetUser",
      title: "Người nhận",
      render: (item) => {
        // Handle new schema with targetType and targetUsers array
        if (item.targetType === 'broadcast') {
          return <span className="text-muted-foreground">Tất cả (Broadcast)</span>;
        }

        // Check targetUsers array first (new schema)
        if (item.targetUsers && item.targetUsers.length > 0) {
          if (item.targetUsers.length === 1) {
            return <span>{item.targetUsers[0].name || item.targetUsers[0].email || 'Unknown'}</span>;
          }
          // Multiple users (group notification)
          return (
            <span title={item.targetUsers.map(u => u.name).join(', ')}>
              {item.targetUsers.length} người dùng
            </span>
          );
        }

        // Fallback to legacy targetUser field
        if (item.targetUser) {
          return <span>{item.targetUser.name || item.targetUser.email || 'Unknown'}</span>;
        }

        return <span className="text-muted-foreground">Tất cả (Broadcast)</span>;
      },
    },
    {
      key: "createdAt",
      title: "Thời gian gửi",
      render: (item) => (
        <span className="text-muted-foreground">
          {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
        </span>
      ),
    },
    {
      key: "sender",
      title: "Người gửi",
      render: (item) => <span>{item.sender?.name || "Admin"}</span>,
    },
    {
      key: "actions",
      title: "",
      render: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Mở menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailNotification(item)}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setResendNotification(item)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Gửi lại
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setNotificationToDelete(item);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];


  return (
    <>
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={data}
          emptyMessage="Chưa có thông báo nào được gửi."
        />
        <DataTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>

      {/* Detail Modal */}
      <NotificationDetailModal
        notification={detailNotification}
        open={!!detailNotification}
        onOpenChange={(open) => !open && setDetailNotification(null)}
      />

      {/* Resend Modal */}
      <ResendNotificationModal
        notification={resendNotification}
        open={!!resendNotification}
        onOpenChange={(open) => !open && setResendNotification(null)}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thông báo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa thông báo &quot;{notificationToDelete?.title}&quot;? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
