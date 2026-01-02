"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, ChevronsUpDown, Users, Search, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { fetchUsersForNotification, UserSelectItem } from "../actions";

interface MultiUserSelectorProps {
  value: UserSelectItem[];
  onSelect: (users: UserSelectItem[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDisplay?: number;
}

export function MultiUserSelector({
  value = [],
  onSelect,
  placeholder = "Chọn users...",
  disabled = false,
  maxDisplay = 3,
}: MultiUserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserSelectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const loadUsers = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      const result = await fetchUsersForNotification(searchTerm, 1, 50);
      if (result.success && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load users when popover opens
  useEffect(() => {
    if (open) {
      loadUsers(search);
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open, loadUsers]);

  // Debounce search
  useEffect(() => {
    if (!open) return;
    
    const timer = setTimeout(() => {
      loadUsers(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, open, loadUsers]);

  const isSelected = (user: UserSelectItem) => {
    return value.some((u) => u.id === user.id);
  };

  const handleToggle = (user: UserSelectItem) => {
    if (isSelected(user)) {
      onSelect(value.filter((u) => u.id !== user.id));
    } else {
      onSelect([...value, user]);
    }
  };

  const handleRemove = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(value.filter((u) => u.id !== userId));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect([]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-[40px]"
            disabled={disabled}
          >
            {value.length > 0 ? (
              <div className="flex items-center gap-2 truncate">
                <Users className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  Đã chọn {value.length} user{value.length > 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={searchRef}
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          <ScrollArea className="h-[250px]">
            {users.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {loading ? "Đang tải..." : "Không tìm thấy user nào."}
              </div>
            ) : (
              <div className="p-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleToggle(user)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      isSelected(user) && "bg-accent"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected(user) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
          {value.length > 0 && (
            <div className="border-t p-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {value.length} user(s) đã chọn
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 text-xs"
              >
                Bỏ chọn tất cả
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Selected users badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, maxDisplay).map((user) => (
            <Badge
              key={user.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="max-w-[100px] truncate">{user.name}</span>
              <button
                type="button"
                onClick={(e) => handleRemove(user.id, e)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {value.length > maxDisplay && (
            <Badge variant="outline">
              +{value.length - maxDisplay} khác
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
