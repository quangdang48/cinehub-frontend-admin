"use client";

import { useNotifications } from "@/providers/notification-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { NotificationSender } from "./notification-sender";

export function NotificationTester() {
  const { 
    isConnected, 
    clientId, 
    notifications, 
    connect, 
    disconnect, 
    clearNotifications 
  } = useNotifications();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Connection Status */}
      <div className="space-y-6 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái kết nối</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={cn(
              "p-3 rounded-md text-center font-medium transition-colors",
              isConnected 
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {isConnected ? "Đã kết nối" : "Ngắt kết nối"}
            </div>
            
            <p className="text-sm">
              Client ID của bạn: <br/>
              <strong className="font-mono text-xs bg-muted p-1 rounded block mt-1 break-all">
                {clientId || "-"}
              </strong>
            </p>

            <div className="flex gap-2">
              <Button 
                onClick={connect} 
                disabled={isConnected}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                Kết nối
              </Button>
              <Button 
                onClick={disconnect} 
                disabled={!isConnected}
                variant="destructive"
                className="w-full"
                size="sm"
              >
                Ngắt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Sender & Received Log */}
      <div className="space-y-6 lg:col-span-2">
        <NotificationSender />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Log thông báo nhận được</CardTitle>
            <Button variant="outline" size="sm" onClick={clearNotifications}>
              Xóa log
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-75 pr-4">
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Chưa có thông báo nào
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-4 rounded-lg border",
                        notification.type === 'error' ? "bg-red-50 border-red-200 dark:bg-red-900/10" :
                        notification.type === 'success' ? "bg-green-50 border-green-200 dark:bg-green-900/10" :
                        notification.type === 'warning' ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10" :
                        "bg-blue-50 border-blue-200 dark:bg-blue-900/10"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{notification.title}</h4>
                        <Badge variant="outline">{notification.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2 text-right">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
