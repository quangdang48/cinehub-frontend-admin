"use client";

import * as React from "react";
import { Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";

interface DataTableToolbarProps<T> {
  columns: Column<T>[];
  visibleColumns: string[];
  onToggleColumn: (columnKey: string) => void;
  children?: React.ReactNode;
}

/**
 * Toolbar component cho data table với column visibility toggle
 * Có thể mở rộng với các actions khác (filters, export, etc.)
 */
export function DataTableToolbar<T>({
  columns,
  visibleColumns,
  onToggleColumn,
  children,
}: DataTableToolbarProps<T>) {
  // Lọc các cột có thể ẩn/hiện
  const hideableColumns = columns.filter((col) => col.hideable);

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b">
      {/* Custom actions slot */}
      <div className="flex items-center gap-2 flex-1">
        {children}
      </div>

      {/* Column visibility control */}
      {hideableColumns.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="mr-2 h-4 w-4" />
              Hiển thị cột
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-50">
            <DropdownMenuLabel>Chọn cột hiển thị</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hideableColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visibleColumns.includes(column.key)}
                onCheckedChange={() => onToggleColumn(column.key)}
              >
                {column.title}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
