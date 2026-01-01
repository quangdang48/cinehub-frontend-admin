import { NotificationTester } from "@/modules/notifications";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Thông báo Realtime</h1>
        <p className="text-muted-foreground">
          Công cụ kiểm tra kết nối SSE và gửi thông báo broadcast.
        </p>
      </div>
      
      <NotificationTester />
    </div>
  );
}
