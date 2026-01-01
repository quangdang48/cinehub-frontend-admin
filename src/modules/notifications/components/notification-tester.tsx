"use client";

import { useState, useTransition } from "react";
import { useNotifications } from "@/providers/notification-provider";
import { broadcastNotification } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function NotificationTester() {
  const { 
    isConnected, 
    clientId, 
    notifications, 
    connect, 
    disconnect, 
    clearNotifications 
  } = useNotifications();

  const [title, setTitle] = useState("Test Notification");
  const [message, setMessage] = useState("Hello! This is a test notification.");
  const [type, setType] = useState<"info" | "success" | "warning" | "error">("info");
  const [isPending, startTransition] = useTransition();

  const handleBroadcast = () => {
    if (!title || !message) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }

    startTransition(async () => {
      const result = await broadcastNotification({
        title,
        message,
        type,
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn(
            "p-3 rounded-md text-center font-medium transition-colors",
            isConnected 
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {isConnected ? "Connected ✓" : "Disconnected"}
          </div>
          
          <p className="text-sm">
            Client ID: <strong className="font-mono">{clientId || "-"}</strong>
          </p>

          <div className="flex gap-2">
            <Button 
              onClick={connect} 
              disabled={isConnected}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Connect
            </Button>
            <Button 
              onClick={disconnect} 
              disabled={!isConnected}
              variant="destructive"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Send Notification */}
      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleBroadcast} 
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "📢 Broadcast to All"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Received Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Received Notifications</CardTitle>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={clearNotifications}
            disabled={notifications.length === 0}
          >
            Clear All
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No notifications yet...
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "p-3 rounded-md border-l-4 animate-in fade-in slide-in-from-bottom-2",
                      notif.type === "info" && "bg-blue-50 border-blue-500 dark:bg-blue-950/30",
                      notif.type === "success" && "bg-green-50 border-green-500 dark:bg-green-950/30",
                      notif.type === "warning" && "bg-yellow-50 border-yellow-500 dark:bg-yellow-950/30",
                      notif.type === "error" && "bg-red-50 border-red-500 dark:bg-red-950/30",
                    )}
                  >
                    <div className="font-bold mb-1">{notif.title || "Notification"}</div>
                    <div className="text-sm mb-1">{notif.message || notif.content}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(notif.timestamp).toLocaleString("vi-VN")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
