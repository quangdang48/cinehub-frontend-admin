export enum BillingCycle {
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
    LIFETIME = "LIFETIME",
}

export enum PlanType {
    FREE = "FREE",
    BASIC = "BASIC",
    PREMIUM = "PREMIUM",
}

export interface Plan {
    id: string;
    name: string;
    description?: string;
    price: number;
    durationDays: number;
    stripeProductId: string;
    stripePriceId: string;
    billingCycle: BillingCycle;
    planType: PlanType;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface CreatePlanDto {
    name: string;
    description?: string;
    price: number;
    durationDays: number;
    stripeProductId: string;
    stripePriceId: string;
    billingCycle: BillingCycle;
    planType: PlanType;
    isActive?: boolean;
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> { }

export interface PlanFilters {
    page?: number;
    limit?: number;
}

export const billingCycleLabels: Record<BillingCycle, string> = {
    [BillingCycle.MONTHLY]: "Hàng tháng",
    [BillingCycle.YEARLY]: "Hàng năm",
    [BillingCycle.LIFETIME]: "Trọn đời",
};

export const planTypeLabels: Record<PlanType, string> = {
    [PlanType.FREE]: "Miễn phí",
    [PlanType.BASIC]: "Cơ bản",
    [PlanType.PREMIUM]: "Cao cấp",
};
