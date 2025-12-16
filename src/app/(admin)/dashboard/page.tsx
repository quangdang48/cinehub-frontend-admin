import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Film, DollarSign, TrendingUp, Eye } from "lucide-react";

// Mock data - Replace with actual API calls
async function getDashboardStats() {
  return {
    totalUsers: 12543,
    totalMovies: 2456,
    revenue: 125430,
    activeSubscriptions: 8234,
    totalViews: 1234567,
    newUsersToday: 123,
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {trendValue && (
          <p
            className={`text-xs ${
              trend === "up" ? "text-green-600" : "text-red-600"
            } mt-1`}
          >
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function DashboardContent() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng người dùng"
          value={stats.totalUsers}
          icon={Users}
          trend="up"
          trendValue="+12% so với tháng trước"
        />
        <StatCard
          title="Tổng phim"
          value={stats.totalMovies}
          icon={Film}
          trend="up"
          trendValue="+18 phim mới"
        />
        <StatCard
          title="Doanh thu"
          value={`$${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="+23% so với tháng trước"
        />
        <StatCard
          title="Gói đăng ký hoạt động"
          value={stats.activeSubscriptions}
          icon={TrendingUp}
          trend="up"
          trendValue="+15%"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Lượt xem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Tổng lượt xem trên toàn bộ nền tảng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Người dùng mới hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.newUsersToday.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Người dùng đăng ký trong 24h qua
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Tổng quan hệ thống CineHub
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
