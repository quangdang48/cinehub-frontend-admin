import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardClient } from "./dashboard-client";

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

// Dữ liệu biểu đồ doanh thu theo tháng
function getRevenueData() {
  return [
    { month: "T1", revenue: 45000, users: 1200 },
    { month: "T2", revenue: 52000, users: 1350 },
    { month: "T3", revenue: 48000, users: 1280 },
    { month: "T4", revenue: 61000, users: 1450 },
    { month: "T5", revenue: 55000, users: 1380 },
    { month: "T6", revenue: 67000, users: 1520 },
    { month: "T7", revenue: 72000, users: 1680 },
    { month: "T8", revenue: 78000, users: 1750 },
    { month: "T9", revenue: 82000, users: 1890 },
    { month: "T10", revenue: 95000, users: 2100 },
    { month: "T11", revenue: 110000, users: 2350 },
    { month: "T12", revenue: 125430, users: 2543 },
  ];
}

// Dữ liệu người dùng mới theo tuần
function getNewUsersData() {
  return [
    { week: "Tuần 1", newUsers: 245, activeUsers: 890 },
    { week: "Tuần 2", newUsers: 312, activeUsers: 920 },
    { week: "Tuần 3", newUsers: 287, activeUsers: 950 },
    { week: "Tuần 4", newUsers: 356, activeUsers: 1020 },
    { week: "Tuần 5", newUsers: 398, activeUsers: 1100 },
    { week: "Tuần 6", newUsers: 423, activeUsers: 1180 },
  ];
}

// Dữ liệu phân bố gói đăng ký
function getSubscriptionData() {
  return [
    { name: "Cơ bản", value: 3500, fill: "#3b82f6" },    // blue-500
    { name: "Tiêu chuẩn", value: 2800, fill: "#8b5cf6" }, // violet-500
    { name: "Cao cấp", value: 1934, fill: "#f59e0b" },    // amber-500
  ];
}

// Dữ liệu lượt xem theo ngày (7 ngày gần nhất)
function getViewsData() {
  return [
    { day: "Thứ 2", views: 45230, movies: 120 },
    { day: "Thứ 3", views: 52340, movies: 145 },
    { day: "Thứ 4", views: 48900, movies: 132 },
    { day: "Thứ 5", views: 61200, movies: 168 },
    { day: "Thứ 6", views: 78500, movies: 210 },
    { day: "Thứ 7", views: 95600, movies: 285 },
    { day: "CN", views: 102300, movies: 312 },
  ];
}

// Dữ liệu thể loại phim phổ biến
function getGenreData() {
  return [
    { genre: "Hành động", count: 450 },
    { genre: "Hài", count: 380 },
    { genre: "Tình cảm", count: 320 },
    { genre: "Kinh dị", count: 280 },
    { genre: "Khoa học", count: 240 },
    { genre: "Hoạt hình", count: 200 },
  ];
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64">
        <Skeleton className="h-full w-full" />
      </div>
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
    <DashboardClient
      stats={stats}
      revenueData={getRevenueData()}
      newUsersData={getNewUsersData()}
      subscriptionData={getSubscriptionData()}
      viewsData={getViewsData()}
      genreData={getGenreData()}
    />
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
