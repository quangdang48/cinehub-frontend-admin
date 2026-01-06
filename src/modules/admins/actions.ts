"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, ActionResult, PaginatedApiResponse } from "@/types/api";
import type { Admin, CreateAdminDto, UpdateAdminDto, AdminFilters } from "./types";

export async function getAdmins(
    filters: AdminFilters = {}
): Promise<PaginatedApiResponse<Admin>> {
    try {
        const params: Record<string, string | number | undefined> = {
            page: filters.page || 1,
            limit: filters.limit || 10,
        };
        if (filters.search) params.search = filters.search;
        if (filters.sort) params.sort = filters.sort;

        const response = await api.get<PaginatedApiResponse<Admin>>("/admins", params);
        return response;
    } catch (error) {
        console.error("Error fetching admins:", error);
        return {
            success: false,
            timestamp: new Date().toISOString(),
            path: "/admins",
            data: [],
            totalItems: 0,
            totalPages: 0,
            itemsPerPage: 10,
            currentPage: 1,
        };
    }
}

export async function getAdminById(id: string): Promise<Admin | null> {
    try {
        const response = await api.get<ApiResponse<Admin>>(`/admins/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching admin:", error);
        return null;
    }
}

export async function createAdmin(
    data: CreateAdminDto
): Promise<ActionResult<Admin>> {
    try {
        const response = await api.post<ApiResponse<Admin>>("/admins", data);
        revalidatePath("/admins");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Error creating admin:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}

export async function updateAdmin(
    id: string,
    data: UpdateAdminDto
): Promise<ActionResult<Admin>> {
    try {
        const response = await api.put<ApiResponse<Admin>>(`/admins/${id}`, data);
        revalidatePath("/admins");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Error updating admin:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}

export async function banAdmin(id: string): Promise<ActionResult> {
    try {
        await api.put(`/admins/${id}/ban`);
        revalidatePath("/admins");
        return {
            success: true,
        };
    } catch (error) {
        console.error("Error banning admin:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}

export async function unbanAdmin(id: string): Promise<ActionResult> {
    try {
        await api.put(`/admins/${id}/unban`);
        revalidatePath("/admins");
        return {
            success: true,
        };
    } catch (error) {
        console.error("Error unbanning admin:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}
