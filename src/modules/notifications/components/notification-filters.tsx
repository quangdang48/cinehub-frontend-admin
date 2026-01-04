"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Filter, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserSelector } from "./user-selector";
import { UserSelectItem } from "../actions";

interface NotificationFiltersProps {
  currentType?: string;
  currentUserId?: string;
  currentSort?: string;
}

const TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "info", label: "Thông tin (Info)" },
  { value: "success", label: "Thành công (Success)" },
  { value: "warning", label: "Cảnh báo (Warning)" },
  { value: "error", label: "Lỗi (Error)" },
] as const;

const SORT_OPTIONS = [
  { value: "desc", label: "Mới nhất" },
  { value: "asc", label: "Cũ nhất" },
] as const;

export function NotificationFilters({
  currentType,
  currentUserId,
  currentSort = "desc",
}: NotificationFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedUser, setSelectedUser] = useState<UserSelectItem | null>(null);

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Reset to page 1 when filters change
      params.set("page", "1");
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleTypeChange = (value: string) => {
    updateFilters({ type: value === "all" ? null : value });
  };

  const handleSortChange = (value: string) => {
    updateFilters({ sort: value });
  };

  const handleUserChange = (user: UserSelectItem | null) => {
    setSelectedUser(user);
    updateFilters({ targetUserId: user?.id || null });
  };

  const handleClearFilters = () => {
    setSelectedUser(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("type");
    params.delete("targetUserId");
    params.delete("sort");
    params.set("page", "1");
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const hasActiveFilters = currentType || currentUserId || currentSort !== "desc";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Bộ lọc:</span>
        </div>

        {/* Type Filter */}
        <Select
          value={currentType || "all"}
          onValueChange={handleTypeChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Loại thông báo" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* User Filter */}
        <div className="w-[220px]">
          <UserSelector
            value={selectedUser}
            onSelect={handleUserChange}
            placeholder="Lọc theo người nhận..."
            disabled={isPending}
          />
        </div>

        {/* Sort */}
        <Select
          value={currentSort || "desc"}
          onValueChange={handleSortChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-[130px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          disabled={isPending}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="mr-1 h-4 w-4" />
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}
