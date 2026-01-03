"use client";

import { useDataTable } from "@/hooks/use-data-table";
import { NotificationHistoryTable } from "./notification-history-table";
import { Notification } from "../types";

interface NotificationHistoryProps {
  data: Notification[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
}

export function NotificationHistory({
  data,
  totalPages,
  totalItems,
  currentPage,
  pageSize,
}: NotificationHistoryProps) {
  const { handlePageChange, handlePageSizeChange } = useDataTable({
    defaultPageSize: pageSize,
  });

  return (
    <NotificationHistoryTable
      data={data}
      totalPages={totalPages}
      totalItems={totalItems}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
