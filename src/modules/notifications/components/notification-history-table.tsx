"use client";

import { format } from "date-fns";
import { Notification } from "../types";
import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";

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
        <span className="line-clamp-2 max-w-[300px]" title={item.message}>
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
      render: (item) => (
        <span>
          {item.targetUser ? item.targetUser.name || item.targetUser.email : "Tất cả (Broadcast)"}
        </span>
      ),
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
  ];

  return (
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
  );
}
