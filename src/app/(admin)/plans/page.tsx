import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";

const plans = [
  {
    id: "1",
    name: "Basic",
    price: 99000,
    duration: "1 tháng",
    features: ["Xem phim HD", "1 thiết bị", "Không quảng cáo"],
    active: true,
  },
  {
    id: "2",
    name: "Premium",
    price: 199000,
    duration: "1 tháng",
    features: ["Xem phim Full HD", "3 thiết bị", "Không quảng cáo", "Tải xuống offline"],
    active: true,
  },
  {
    id: "3",
    name: "VIP",
    price: 299000,
    duration: "1 tháng",
    features: ["Xem phim 4K", "5 thiết bị", "Không quảng cáo", "Tải xuống offline", "Ưu tiên hỗ trợ"],
    active: true,
  },
];

export default function PlansPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý gói dịch vụ</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý các gói đăng ký và giá cả
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm gói mới
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.active ? (
                  <Badge variant="default">Đang hoạt động</Badge>
                ) : (
                  <Badge variant="secondary">Tạm dừng</Badge>
                )}
              </div>
              <CardDescription>{plan.duration}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {plan.price.toLocaleString()}đ
                </span>
                <span className="text-muted-foreground">/{plan.duration}</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Chỉnh sửa
              </Button>
              <Button variant="ghost" className="flex-1">
                Xóa
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
