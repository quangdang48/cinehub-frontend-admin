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
import {
  getDashboardStats,
  getRevenueByMonth,
  getUsersByWeek,
  getSubscriptionDistribution,
  getActivityByDay,
  getTopCountries,
} from "./actions";

// Force dynamic rendering (no static pre-rendering)
export const dynamic = "force-dynamic";

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
  // Fetch all dashboard data in parallel
  const [
    stats,
    revenueData,
    newUsersData,
    subscriptionData,
    activityData,
    countryData,
  ] = await Promise.all([
    getDashboardStats(),
    getRevenueByMonth(),
    getUsersByWeek(),
    getSubscriptionDistribution(),
    getActivityByDay(),
    getTopCountries(),
  ]);

  // Transform data to match the expected format for charts
  const transformedStats = {
    totalUsers: stats.totalUsers,
    totalMovies: stats.totalFilms,
    revenue: stats.revenue,
    activeSubscriptions: stats.totalSubscriptions,
    totalViews: stats.totalViews,
    newUsersToday: stats.newUsersToday,
  };

  // Transform activity data to views format (for area chart)
  const viewsData = activityData.map((item) => ({
    day: item.day,
    views: item.subscriptions * 100, // Approximate views based on activity
    movies: item.films,
  }));

  // Transform country data to genre format (for horizontal bar chart)
  const genreData = countryData.map((item) => ({
    genre: item.country,
    count: item.count,
  }));

  return (
    <DashboardClient
      stats={transformedStats}
      revenueData={revenueData}
      newUsersData={newUsersData}
      subscriptionData={subscriptionData}
      viewsData={viewsData}
      genreData={genreData}
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
