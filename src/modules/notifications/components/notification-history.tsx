"use client";

import { useDataTable } from "@/hooks/use-data-table";
import { NotificationHistoryTable } from "./notification-history-table";
import { NotificationFilters } from "./notification-filters";
import { Notification } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { History } from "lucide-react";

interface NotificationHistoryProps {
  data: Notification[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  // Filter props
  currentType?: string;
  currentUserId?: string;
  currentSort?: string;
}

export function NotificationHistory({
  data,
  totalPages,
  totalItems,
  currentPage,
  pageSize,
  currentType,
  currentUserId,
  currentSort,
}: NotificationHistoryProps) {
  const { handlePageChange, handlePageSizeChange } = useDataTable({
    defaultPageSize: pageSize,
  });

  const hasFilters = currentType || currentUserId;
  const noResults = data.length === 0 && hasFilters;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Lịch sử thông báo
        </CardTitle>
        <CardDescription>
          Xem và quản lý các thông báo đã gửi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <NotificationFilters
          currentType={currentType}
          currentUserId={currentUserId}
          currentSort={currentSort}
        />
        
        {noResults ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy thông báo nào phù hợp với bộ lọc.
            </p>
          </div>
        ) : (
          <NotificationHistoryTable
            data={data}
            totalPages={totalPages}
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </CardContent>
    </Card>
  );
}
