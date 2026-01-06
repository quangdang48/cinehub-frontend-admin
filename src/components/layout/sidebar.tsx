"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SIDEBAR_ITEMS } from "@/constants";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard, Film, Tags, UserCircle, Clapperboard,
  Receipt, CreditCard, Users, BarChart3, MessageSquare,
  Star, Settings, Shield, Bell, UserSquare, ChevronLeft, PanelLeft
} from "lucide-react";

const icons: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Film: <Film className="h-4 w-4" />,
  Tags: <Tags className="h-4 w-4" />,
  UserCircle: <UserCircle className="h-4 w-4" />,
  Clapperboard: <Clapperboard className="h-4 w-4" />,
  Receipt: <Receipt className="h-4 w-4" />,
  CreditCard: <CreditCard className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  MessageSquare: <MessageSquare className="h-4 w-4" />,
  Star: <Star className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
  Admins: <Shield className="h-4 w-4" />,
  Bell: <Bell className="h-4 w-4" />,
  Profile: <UserSquare className="h-4 w-4" />,
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b px-3">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 pl-2 transition-all">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Clapperboard className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">CineHub</span>
          </Link>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("ml-auto", isCollapsed ? "mx-auto" : "")}
        >
          {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation List */}
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          <TooltipProvider delayDuration={0}>
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              // Render Logic
              const LinkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  {icons[item.icon]}
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              );

              // Nếu collapsed thì bọc Tooltip, nếu không thì render Link thường
              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {LinkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{LinkContent}</div>;
            })}
          </TooltipProvider>
        </nav>
      </ScrollArea>
    </aside>
  );
}