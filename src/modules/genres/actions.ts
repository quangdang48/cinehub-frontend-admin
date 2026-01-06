"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, ActionResult, PaginatedApiResponse } from "@/types/api";
import type { Genre, CreateGenreDto, UpdateGenreDto, GenreFilters } from "./types";

export async function getGenres(
    filters: GenreFilters = {}
): Promise<PaginatedApiResponse<Genre>> {
    try {
        const params: Record<string, string | number | undefined> = {
            page: filters.page || 1,
            limit: filters.limit || 10,
        };
        if (filters.search) params.search = filters.search;
        if (filters.sort) params.sort = filters.sort;

        const response = await api.get<PaginatedApiResponse<Genre>>("/genres", params);
        return response;
    } catch (error) {
        console.error("Error fetching genres:", error);
        return {
            success: false,
            timestamp: new Date().toISOString(),
            path: "/genres",
            data: [],
            totalItems: 0,
            totalPages: 0,
            itemsPerPage: 10,
            currentPage: 1,
        };
    }
}

export async function getGenreById(id: string): Promise<Genre | null> {
    try {
        const response = await api.get<ApiResponse<Genre>>(`/genres/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching genre:", error);
        return null;
    }
}

export async function createGenre(
    data: CreateGenreDto
): Promise<ActionResult<Genre>> {
    try {
        const response = await api.post<ApiResponse<Genre>>("/genres", data);
        revalidatePath("/genres");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Error creating genre:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}

export async function updateGenre(
    id: string,
    data: UpdateGenreDto
): Promise<ActionResult<Genre>> {
    try {
        const response = await api.put<ApiResponse<Genre>>(`/genres/${id}`, data);
        revalidatePath("/genres");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error("Error updating genre:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}

export async function deleteGenre(id: string): Promise<ActionResult> {
    try {
        await api.delete(`/genres/${id}`);
        revalidatePath("/genres");
        return {
            success: true,
        };
    } catch (error) {
        console.error("Error deleting genre:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}
