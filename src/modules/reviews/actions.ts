"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import type { ActionResult, PaginatedApiResponse } from "@/types/api";
import type { Review, ReviewFilters } from "./types";

export async function getReviews(
    filters: ReviewFilters = {}
): Promise<PaginatedApiResponse<Review>> {
    try {
        const params: Record<string, string | number | undefined> = {
            page: filters.page || 1,
            limit: filters.limit || 10,
        };
        if (filters.filmId) params.filmId = filters.filmId;

        const response = await api.get<PaginatedApiResponse<Review>>("/reviews", params);
        return response;
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return {
            success: false,
            timestamp: new Date().toISOString(),
            path: "/reviews",
            data: [],
            totalItems: 0,
            totalPages: 0,
            itemsPerPage: 10,
            currentPage: 1,
        };
    }
}

export async function deleteReview(id: string): Promise<ActionResult> {
    try {
        await api.delete(`/reviews/${id}`);
        revalidatePath("/reviews");
        return {
            success: true,
        };
    } catch (error) {
        console.error("Error deleting review:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}
