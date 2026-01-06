import { 
  NotificationTester, 
  NotificationHistory, 
  fetchNotificationHistory, 
  NotificationTabs,
  Notification 
} from "@/modules/notifications";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string; 
    limit?: string; 
    tab?: string; 
    sort?: string;
    type?: string;
    targetUserId?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const sort = params.sort || 'desc';
  const type = params.type;
  const targetUserId = params.targetUserId;

  const result = await fetchNotificationHistory(page, limit, type, targetUserId, sort);
  
  let historyData: { 
      data: Notification[]; 
      totalPages: number; 
      totalItems: number; 
      currentPage: number; 
      pageSize: number;
  } = { 
      data: [], 
      totalPages: 0, 
      totalItems: 0, 
      currentPage: 1, 
      pageSize: 10 
  };

  if ('data' in result) {
      historyData = {
          data: result.data,
          totalPages: result.totalPages,
          totalItems: result.totalItems,
          currentPage: result.currentPage,
          pageSize: result.itemsPerPage
      };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Thông báo</h1>
        <p className="text-muted-foreground">
          Gửi thông báo và xem lịch sử gửi.
        </p>
      </div>

      <NotificationTabs 
        sendContent={<NotificationTester />}
        historyContent={
             <NotificationHistory 
                data={historyData.data}
                totalPages={historyData.totalPages}
                totalItems={historyData.totalItems}
                currentPage={historyData.currentPage}
                pageSize={historyData.pageSize}
                currentType={type}
                currentUserId={targetUserId}
                currentSort={sort}
             />
        }
      />
    </div>
  );
}

