"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationTabsProps {
  sendContent: React.ReactNode;
  historyContent: React.ReactNode;
  defaultTab?: string;
}

export function NotificationTabs({ sendContent, historyContent, defaultTab = "send" }: NotificationTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || defaultTab;

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    // Reset page when switching tabs? Maybe not necessary.
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="send">Gửi thông báo</TabsTrigger>
        <TabsTrigger value="history">Lịch sử</TabsTrigger>
      </TabsList>
      <TabsContent value="send" className="space-y-4">
        {sendContent}
      </TabsContent>
      <TabsContent value="history" className="space-y-4">
        {historyContent}
      </TabsContent>
    </Tabs>
  );
}
