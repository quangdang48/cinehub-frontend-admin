"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Film,
  DollarSign,
  TrendingUp,
  Eye,
  BarChart3,
  Hash,
} from "lucide-react";
import { DashboardCharts } from "./charts";

interface DashboardStats {
  totalUsers: number;
  totalMovies: number;
  revenue: number;
  activeSubscriptions: number;
  totalViews: number;
  newUsersToday: number;
}

interface DashboardClientProps {
  stats: DashboardStats;
  revenueData: Array<{ month: string; revenue: number; users: number }>;
  newUsersData: Array<{ week: string; newUsers: number; activeUsers: number }>;
  subscriptionData: Array<{ name: string; value: number; fill: string }>;
  viewsData: Array<{ day: string; views: number; movies: number }>;
  genreData: Array<{ genre: string; count: number }>;
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  color?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className={`h-1 ${color || "bg-primary"}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color ? `${color}/10` : "bg-primary/10"}`}>
          <Icon className={`h-4 w-4 ${color ? color.replace("bg-", "text-") : "text-primary"}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {trendValue && (
          <p
            className={`text-xs ${
              trend === "up" ? "text-emerald-600" : "text-red-600"
            } mt-1 flex items-center gap-1`}
          >
            <span className={`inline-block ${trend === "up" ? "rotate-0" : "rotate-180"}`}>
              ▲
            </span>
            {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardClient({
  stats,
  revenueData,
  newUsersData,
  subscriptionData,
  viewsData,
  genreData,
}: DashboardClientProps) {
  return (
    <Tabs defaultValue="numbers" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="numbers" className="flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Số liệu
        </TabsTrigger>
        <TabsTrigger value="charts" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Biểu đồ
        </TabsTrigger>
      </TabsList>

      {/* Tab Số liệu */}
      <TabsContent value="numbers" className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng người dùng"
            value={stats.totalUsers}
            icon={Users}
            trend="up"
            trendValue="+12% so với tháng trước"
            color="bg-blue-500"
          />
          <StatCard
            title="Tổng phim"
            value={stats.totalMovies}
            icon={Film}
            trend="up"
            trendValue="+18 phim mới"
            color="bg-purple-500"
          />
          <StatCard
            title="Doanh thu"
            value={`${stats.revenue.toLocaleString('vi-VN')} ₫`}
            icon={DollarSign}
            trend="up"
            trendValue="+23% so với tháng trước"
            color="bg-emerald-500"
          />
          <StatCard
            title="Gói đăng ký hoạt động"
            value={stats.activeSubscriptions}
            icon={TrendingUp}
            trend="up"
            trendValue="+15%"
            color="bg-orange-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="h-1 bg-cyan-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-cyan-500/10">
                  <Eye className="h-5 w-5 text-cyan-500" />
                </div>
                Lượt xem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-600">
                {stats.totalViews.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Tổng lượt xem trên toàn bộ nền tảng
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="h-1 bg-pink-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-pink-500/10">
                  <Users className="h-5 w-5 text-pink-500" />
                </div>
                Người dùng mới hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">
                {stats.newUsersToday.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Người dùng đăng ký trong 24h qua
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards with colors */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-white/90">Tỷ lệ chuyển đổi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">65.7%</div>
              <p className="text-white/80 text-sm mt-2">
                Người dùng đăng ký gói Premium
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader>
              <CardTitle className="text-white/90">Doanh thu trung bình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">$10.45</div>
              <p className="text-white/80 text-sm mt-2">
                ARPU (Average Revenue Per User)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white/90">Thời gian xem TB</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">2.5h</div>
              <p className="text-white/80 text-sm mt-2">
                Thời gian xem trung bình/ngày
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Tab Biểu đồ */}
      <TabsContent value="charts" className="space-y-6">
        <DashboardCharts
          revenueData={revenueData}
          newUsersData={newUsersData}
          subscriptionData={subscriptionData}
          viewsData={viewsData}
          genreData={genreData}
        />
      </TabsContent>
    </Tabs>
  );
}
