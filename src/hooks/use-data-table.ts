"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SortConfig } from "@/components/ui/data-table";

interface UseDataTableProps {
  defaultPageSize?: number;
  defaultVisibleColumns?: string[];
  baseUrl?: string;
}

interface UseDataTableReturn {
  currentPage: number;
  pageSize: number;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  sortConfig: SortConfig | undefined;
  handleSort: (key: string) => void;
  visibleColumns: string[];
  toggleColumn: (columnKey: string) => void;
  setVisibleColumns: (columns: string[]) => void;
}

export function useDataTable({
  defaultPageSize = 10,
  defaultVisibleColumns = [],
  baseUrl,
}: UseDataTableProps = {}): UseDataTableReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Column visibility state (client-side only, không sync với URL)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultVisibleColumns);

  // Pagination state từ URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || defaultPageSize;

  // Sorting state từ URL
  const sortKey = searchParams.get("sortBy") || undefined;
  const sortDirection = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  const sortConfig: SortConfig | undefined = useMemo(() => 
    sortKey ? { key: sortKey, direction: sortDirection } : undefined,
    [sortKey, sortDirection]
  );

  // Helper để update URL params
  const updateUrl = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value.toString());
    });

    const url = baseUrl || window.location.pathname;
    router.push(`${url}?${params.toString()}`);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    updateUrl({ page });
  };

  const handlePageSizeChange = (size: number) => {
    updateUrl({ limit: size, page: 1 }); // Reset về trang 1
  };

  // Sorting handler
  const handleSort = (key: string) => {
    const updates: Record<string, string | number> = { page: 1 }; // Reset về trang 1
    
    // Toggle direction nếu click cùng column
    if (sortKey === key) {
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      updates.sortOrder = newDirection;
    } else {
      updates.sortBy = key;
      updates.sortOrder = "desc"; // Default desc cho column mới
    }
    
    updateUrl(updates);
  };

  // Column visibility handler
  const toggleColumn = (columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  return {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    sortConfig,
    handleSort,
    visibleColumns,
    toggleColumn,
    setVisibleColumns,
  };
}
