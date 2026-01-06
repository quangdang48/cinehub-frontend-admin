"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanCard, PlanForm } from "@/modules/plans/components";
import type { Plan } from "@/modules/plans";
import type { PaginatedApiResponse } from "@/types/api";
import { PlanType } from "@/modules/plans/types";

interface PlansPageClientProps {
    data: PaginatedApiResponse<Plan>;
}

export function PlansPageClient({ data }: PlansPageClientProps) {
    const router = useRouter();
    const [formOpen, setFormOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    // Filter out FREE plans (0đ)
    const filteredPlans = useMemo(() => {
        return data.data.filter(plan => plan.planType !== PlanType.FREE && plan.price > 0);
    }, [data.data]);

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setFormOpen(true);
    };

    const handleCreate = () => {
        setEditingPlan(null);
        setFormOpen(true);
    };

    const handleSuccess = () => {
        router.refresh();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý gói dịch vụ</h1>
                    <p className="text-muted-foreground">
                        Quản lý các gói đăng ký và giá cả ({filteredPlans.length} gói)
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm gói mới
                </Button>
            </div>

            {/* Plans Grid */}
            {filteredPlans.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPlans.map((plan) => (
                        <PlanCard key={plan.id} plan={plan} onEdit={handleEdit} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    Chưa có gói dịch vụ nào. Bấm &quot;Thêm gói mới&quot; để tạo.
                </div>
            )}

            {/* Form Dialog */}
            <PlanForm
                open={formOpen}
                onOpenChange={setFormOpen}
                plan={editingPlan}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
