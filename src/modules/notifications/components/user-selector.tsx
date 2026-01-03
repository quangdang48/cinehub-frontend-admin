"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, ChevronsUpDown, User, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchUsersForNotification, UserSelectItem } from "../actions";

interface UserSelectorProps {
  value?: UserSelectItem | null;
  onSelect: (user: UserSelectItem | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function UserSelector({
  value,
  onSelect,
  placeholder = "Chọn user...",
  disabled = false,
}: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserSelectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const loadUsers = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      console.log("Loading users with search:", searchTerm);
      const result = await fetchUsersForNotification(searchTerm, 1, 20);
      console.log("Fetch users result:", result);
      if (result.success && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        console.log("Result not successful or data not array:", result);
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
      // Focus search input when popover opens
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

  const handleSelect = (user: UserSelectItem) => {
    onSelect(user.id === value?.id ? null : user);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value ? (
            <div className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate">{value.name}</span>
              <span className="text-muted-foreground text-xs truncate">
                ({value.email})
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-100 p-0" align="start">
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
        <ScrollArea className="h-50">
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
                  onClick={() => handleSelect(user)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    value?.id === user.id && "bg-accent"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.id === user.id ? "opacity-100" : "opacity-0"
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
      </PopoverContent>
    </Popover>
  );
}
