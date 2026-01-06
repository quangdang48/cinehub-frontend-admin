"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, ActionResult, PaginatedApiResponse } from "@/types/api";
import type { User, CreateUserDto, UpdateUserDto, UserFilters } from "./types";

export async function getUsers(
    filters: UserFilters = {}
): Promise<PaginatedApiResponse<User>> {
    try {
        const params: Record<string, string | number | undefined> = {
            page: filters.page || 1,
            limit: filters.limit || 10,
        };
        if (filters.search) params.search = filters.search;
        if (filters.sort) params.sort = filters.sort;

        const response = await api.get<PaginatedApiResponse<User>>("/users", params);
        return response;
    } catch (error) {
        console.error("Error fetching users:", error);
        return {
            success: false,
            timestamp: new Date().toISOString(),
            path: "/users",
            data: [],
            totalItems: 0,
            totalPages: 0,
            itemsPerPage: 10,
            currentPage: 1,
        };
    }
}

export async function getUserById(id: string): Promise<User | null> {
    try {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

export async function updateUser(
    id: string,
    data: UpdateUserDto
): Promise<ActionResult<User>> {
    try {
        const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
        revalidatePath("/users");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Error updating user:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}

export async function banUser(id: string): Promise<ActionResult> {
    try {
        await api.put(`/users/${id}/ban`);
        revalidatePath("/users");
        return {
            success: true,
        };
    } catch (error) {
        console.error("Error banning user:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}

export async function unbanUser(id: string): Promise<ActionResult> {
    try {
        await api.put(`/users/${id}/unban`);
        revalidatePath("/users");
        return {
            success: true,
        };
    } catch (error) {
        console.error("Error unbanning user:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}
