"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createPlan, updatePlan } from "../actions";
import { Plan, BillingCycle, PlanType } from "../types";
import { billingCycleLabels, planTypeLabels } from "../types";

interface PlanFormData {
    name: string;
    description?: string;
    price: number;
    durationDays: number;
    stripeProductId: string;
    stripePriceId: string;
    billingCycle: BillingCycle;
    planType: PlanType;
    isActive: boolean;
}

interface PlanFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan?: Plan | null;
    onSuccess?: () => void;
}

export function PlanForm({ open, onOpenChange, plan, onSuccess }: PlanFormProps) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!plan;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<PlanFormData>({
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            durationDays: 30,
            stripeProductId: "",
            stripePriceId: "",
            billingCycle: BillingCycle.MONTHLY,
            planType: PlanType.BASIC,
            isActive: true,
        },
    });

    useEffect(() => {
        if (open) {
            if (plan) {
                reset({
                    name: plan.name,
                    description: plan.description || "",
                    price: plan.price,
                    durationDays: plan.durationDays,
                    stripeProductId: plan.stripeProductId,
                    stripePriceId: plan.stripePriceId,
                    billingCycle: plan.billingCycle,
                    planType: plan.planType,
                    isActive: plan.isActive,
                });
            } else {
                reset({
                    name: "",
                    description: "",
                    price: 0,
                    durationDays: 30,
                    stripeProductId: "",
                    stripePriceId: "",
                    billingCycle: BillingCycle.MONTHLY,
                    planType: PlanType.BASIC,
                    isActive: true,
                });
            }
        }
    }, [open, plan, reset]);

    const onSubmit = (data: PlanFormData) => {
        startTransition(async () => {
            const result = isEditing
                ? await updatePlan(plan.id, data)
                : await createPlan(data);

            if (result.success) {
                toast.success(isEditing ? "Cập nhật thành công" : "Tạo mới thành công");
                reset();
                onOpenChange(false);
                onSuccess?.();
            } else {
                toast.error(result.error || "Có lỗi xảy ra");
            }
        });
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            reset();
        }
        onOpenChange(isOpen);
    };

    const billingCycle = watch("billingCycle");
    const planType = watch("planType");
    const isActive = watch("isActive");

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Chỉnh sửa gói dịch vụ" : "Thêm gói dịch vụ mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Cập nhật thông tin gói dịch vụ."
                            : "Thêm gói dịch vụ mới vào hệ thống."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Tên gói *</Label>
                            <Input
                                id="name"
                                placeholder="VD: Premium Monthly"
                                {...register("name", { required: "Tên gói không được để trống" })}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                placeholder="Mô tả chi tiết về gói..."
                                {...register("description")}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Giá (VND) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="199000"
                                    {...register("price", {
                                        required: "Giá là bắt buộc",
                                        min: { value: 0, message: "Giá phải >= 0" },
                                        valueAsNumber: true
                                    })}
                                />
                                {errors.price && (
                                    <p className="text-sm text-red-500">{errors.price.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="durationDays">Số ngày *</Label>
                                <Input
                                    id="durationDays"
                                    type="number"
                                    placeholder="30"
                                    {...register("durationDays", {
                                        required: "Số ngày là bắt buộc",
                                        min: { value: 1, message: "Số ngày phải >= 1" },
                                        valueAsNumber: true
                                    })}
                                />
                                {errors.durationDays && (
                                    <p className="text-sm text-red-500">
                                        {errors.durationDays.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Loại gói *</Label>
                                <Select
                                    value={planType}
                                    onValueChange={(value) =>
                                        setValue("planType", value as PlanType)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(planTypeLabels) as PlanType[]).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {planTypeLabels[type]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Chu kỳ thanh toán *</Label>
                                <Select
                                    value={billingCycle}
                                    onValueChange={(value) =>
                                        setValue("billingCycle", value as BillingCycle)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(billingCycleLabels) as BillingCycle[]).map(
                                            (cycle) => (
                                                <SelectItem key={cycle} value={cycle}>
                                                    {billingCycleLabels[cycle]}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="stripeProductId">Stripe Product ID *</Label>
                            <Input
                                id="stripeProductId"
                                placeholder="prod_xxx"
                                {...register("stripeProductId", { required: "Stripe Product ID là bắt buộc" })}
                            />
                            {errors.stripeProductId && (
                                <p className="text-sm text-red-500">
                                    {errors.stripeProductId.message}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="stripePriceId">Stripe Price ID *</Label>
                            <Input
                                id="stripePriceId"
                                placeholder="price_xxx"
                                {...register("stripePriceId", { required: "Stripe Price ID là bắt buộc" })}
                            />
                            {errors.stripePriceId && (
                                <p className="text-sm text-red-500">
                                    {errors.stripePriceId.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="isActive"
                                checked={isActive}
                                onCheckedChange={(checked) => setValue("isActive", checked)}
                            />
                            <Label htmlFor="isActive">Kích hoạt ngay</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
                            disabled={isPending}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
