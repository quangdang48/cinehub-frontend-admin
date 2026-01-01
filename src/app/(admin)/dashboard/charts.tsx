"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { TrendingUp, BarChart3, PieChartIcon, Activity } from "lucide-react";

interface DashboardChartsProps {
  revenueData: Array<{ month: string; revenue: number; users: number }>;
  newUsersData: Array<{ week: string; newUsers: number; activeUsers: number }>;
  subscriptionData: Array<{ name: string; value: number; fill: string }>;
  viewsData: Array<{ day: string; views: number; movies: number }>;
  genreData: Array<{ genre: string; count: number }>;
}

// Chart configs với màu sắc đẹp
const revenueChartConfig = {
  revenue: {
    label: "Doanh thu ($)",
    color: "#10b981", // emerald-500
  },
  users: {
    label: "Người dùng mới",
    color: "#3b82f6", // blue-500
  },
} satisfies ChartConfig;

const usersChartConfig = {
  newUsers: {
    label: "Người dùng mới",
    color: "#8b5cf6", // violet-500
  },
  activeUsers: {
    label: "Người dùng hoạt động",
    color: "#f59e0b", // amber-500
  },
} satisfies ChartConfig;

const subscriptionChartConfig = {
  value: {
    label: "Số lượng",
  },
  "Cơ bản": {
    label: "Cơ bản",
    color: "#3b82f6", // blue-500
  },
  "Tiêu chuẩn": {
    label: "Tiêu chuẩn",
    color: "#8b5cf6", // violet-500
  },
  "Cao cấp": {
    label: "Cao cấp",
    color: "#f59e0b", // amber-500
  },
} satisfies ChartConfig;

const viewsChartConfig = {
  views: {
    label: "Lượt xem",
    color: "#06b6d4", // cyan-500
  },
  movies: {
    label: "Phim được xem",
    color: "#ec4899", // pink-500
  },
} satisfies ChartConfig;

const genreChartConfig = {
  count: {
    label: "Số phim",
    color: "#10b981",
  },
} satisfies ChartConfig;

// Màu sắc cho các biểu đồ
const CHART_COLORS = [
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#06b6d4", // cyan-500
];



export function DashboardCharts({
  revenueData,
  newUsersData,
  subscriptionData,
  viewsData,
  genreData,
}: DashboardChartsProps) {
  const totalSubscriptions = subscriptionData.reduce(
    (acc, curr) => acc + curr.value,
    0
  );

  return (
    <div className="space-y-6">
      {/* Row 1: Revenue Bar Chart & User Line Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Biểu đồ doanh thu theo tháng */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Doanh thu theo tháng
            </CardTitle>
            <CardDescription>
              Thống kê doanh thu và người dùng mới trong năm 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[300px]">
              <BarChart data={revenueData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Biểu đồ người dùng mới theo tuần */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Người dùng theo tuần
            </CardTitle>
            <CardDescription>
              Thống kê người dùng mới và hoạt động trong 6 tuần gần nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={usersChartConfig} className="h-[300px]">
              <LineChart data={newUsersData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="var(--color-newUsers)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-newUsers)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="var(--color-activeUsers)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-activeUsers)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Subscription Pie Chart & Views Area Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Biểu đồ tròn phân bố gói đăng ký */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Phân bố gói đăng ký
            </CardTitle>
            <CardDescription>
              Tổng: {totalSubscriptions.toLocaleString()} gói đăng ký
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={subscriptionChartConfig}
              className="h-[300px]"
            >
              <PieChart accessibilityLayer>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={subscriptionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  strokeWidth={5}
                  paddingAngle={2}
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Biểu đồ vùng lượt xem theo ngày */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Lượt xem theo ngày
            </CardTitle>
            <CardDescription>
              Thống kê lượt xem trong 7 ngày gần nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={viewsChartConfig} className="h-[300px]">
              <AreaChart data={viewsData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <defs>
                  <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-views)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-views)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="var(--color-views)"
                  fill="url(#fillViews)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Genre Horizontal Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Thể loại phim phổ biến
          </CardTitle>
          <CardDescription>
            Top 6 thể loại phim được xem nhiều nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={genreChartConfig} className="h-[300px]">
            <BarChart
              data={genreData}
              layout="vertical"
              margin={{ left: 20 }}
              accessibilityLayer
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="genre"
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]}>
                {genreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
