"use client";

import { useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LogOut, User, Settings } from "lucide-react";
import { logout } from "@/modules/auth/actions";
import { NotificationDropdown } from "./notification-dropdown";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

export function Header({ sidebarCollapsed = false }: HeaderProps) {
  const [isPending, startTransition] = useTransition();

  const { data: session } = useSession();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <header
      className={cn(
        "fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6 transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-64"
      )}
    >
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Tìm kiếm..."
            className="h-9 w-64 rounded-md border border-input bg-transparent pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationDropdown />

        {/* User menu */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg p-1 hover:bg-accent">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{session?.user?.name || "Admin User"}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email || "admin@cinehub.vn"}</p>
              </div>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Hồ sơ cá nhân
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
