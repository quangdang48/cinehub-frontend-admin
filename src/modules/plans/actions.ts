"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, ActionResult, PaginatedApiResponse } from "@/types/api";
import type { Plan, CreatePlanDto, UpdatePlanDto, PlanFilters } from "./types";

export async function getPlans(
    filters: PlanFilters = {}
): Promise<PaginatedApiResponse<Plan>> {
    try {
        const params = {
            page: filters.page || 1,
            limit: filters.limit || 10,
        };

        const response = await api.get<PaginatedApiResponse<Plan>>("/plans/active", params);
        return response;
    } catch (error) {
        console.error("Error fetching plans:", error);
        return {
            success: false,
            timestamp: new Date().toISOString(),
            path: "/v1/plans",
            data: [],
            totalItems: 0,
            totalPages: 0,
            itemsPerPage: 10,
            currentPage: 1,
        };
    }
}

export async function getActivePlans(): Promise<Plan[]> {
    try {
        const response = await api.get<ApiResponse<Plan[]>>("plans/active");
        return response.data;
    } catch (error) {
        console.error("Error fetching active plans:", error);
        return [];
    }
}

export async function getPlanById(id: string): Promise<Plan | null> {
    try {
        const response = await api.get<ApiResponse<Plan>>(`plans/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching plan:", error);
        return null;
    }
}

export async function createPlan(
    data: CreatePlanDto
): Promise<ActionResult<Plan>> {
    try {
        const response = await api.post<ApiResponse<Plan>>("plans", data);
        revalidatePath("/plans");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Error creating plan:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}

export async function updatePlan(
    id: string,
    data: UpdatePlanDto
): Promise<ActionResult<Plan>> {
    try {
        const response = await api.put<ApiResponse<Plan>>(`plans/${id}`, data);
        revalidatePath("/plans");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Error updating plan:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}

export async function deletePlan(id: string): Promise<ActionResult> {
    try {
        await api.delete(`/v1/plans/${id}`);
        revalidatePath("/plans");
        return {
            success: true,
        };
    } catch (error) {
        console.error("Error deleting plan:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}

export async function togglePlanActive(id: string): Promise<ActionResult<Plan>> {
    try {
        const response = await api.put<ApiResponse<Plan>>(`plans/${id}/toggle-active`, {});
        revalidatePath("/plans");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Error toggling plan status:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}
