"use client";

import { useState } from "react";
import { Sidebar, Header } from "@/components/layout";
import { cn } from "@/lib/utils";
import { NotificationProvider } from "@/providers/notification-provider";

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <NotificationProvider>
      <div className="flex h-screen overflow-hidden bg-muted/40">
        
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div
          className={cn(
            "flex flex-1 flex-col overflow-hidden transition-all duration-300",
            sidebarCollapsed ? "ml-16" : "ml-64" // Margin left để né Sidebar fixed
          )}
        >
          <Header />

          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}