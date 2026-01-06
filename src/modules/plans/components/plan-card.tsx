"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, MoreVertical, Power, PowerOff, Pencil, Trash2 } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePlan, togglePlanActive } from "../actions";
import type { Plan } from "../types";
import { billingCycleLabels, planTypeLabels } from "../types";
import { useState } from "react";

interface PlanCardProps {
    plan: Plan;
    onEdit: (plan: Plan) => void;
}

export function PlanCard({ plan, onEdit }: PlanCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const handleToggleActive = () => {
        startTransition(async () => {
            const result = await togglePlanActive(plan.id);
            if (result.success) {
                toast.success(
                    plan.isActive ? "Đã tắt gói dịch vụ" : "Đã kích hoạt gói dịch vụ"
                );
                router.refresh();
            } else {
                toast.error(result.error || "Không thể thay đổi trạng thái");
            }
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deletePlan(plan.id);
            if (result.success) {
                toast.success("Xóa gói thành công");
                setDeleteDialogOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Không thể xóa gói");
            }
        });
    };

    // Features based on plan type
    const getFeatures = () => {
        const features = [`${plan.durationDays} ngày sử dụng`];
        switch (plan.planType) {
            case "FREE":
                features.push("Xem phim SD", "1 thiết bị", "Có quảng cáo");
                break;
            case "BASIC":
                features.push("Xem phim HD", "2 thiết bị", "Không quảng cáo");
                break;
            case "PREMIUM":
                features.push(
                    "Xem phim 4K",
                    "5 thiết bị",
                    "Không quảng cáo",
                    "Tải xuống offline"
                );
                break;
        }
        return features;
    };

    return (
        <>
            <Card className={`flex flex-col ${!plan.isActive ? "opacity-60" : ""}`}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle>{plan.name}</CardTitle>
                            <Badge variant={plan.isActive ? "default" : "secondary"}>
                                {plan.isActive ? "Đang hoạt động" : "Tạm dừng"}
                            </Badge>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(plan)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleToggleActive}>
                                    {plan.isActive ? (
                                        <>
                                            <PowerOff className="mr-2 h-4 w-4" />
                                            Tắt kích hoạt
                                        </>
                                    ) : (
                                        <>
                                            <Power className="mr-2 h-4 w-4" />
                                            Kích hoạt
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <CardDescription className="flex gap-2">
                        <Badge variant="outline">{planTypeLabels[plan.planType]}</Badge>
                        <Badge variant="outline">{billingCycleLabels[plan.billingCycle]}</Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="mb-4">
                        <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                        <span className="text-muted-foreground">
                            /{billingCycleLabels[plan.billingCycle].toLowerCase()}
                        </span>
                    </div>
                    {plan.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                            {plan.description}
                        </p>
                    )}
                    <ul className="space-y-2">
                        {getFeatures().map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600 shrink-0" />
                                <span className="text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onEdit(plan)}
                    >
                        Chỉnh sửa
                    </Button>
                </CardFooter>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này sẽ xóa vĩnh viễn gói &quot;{plan.name}&quot;. Không
                            thể hoàn tác sau khi xóa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
