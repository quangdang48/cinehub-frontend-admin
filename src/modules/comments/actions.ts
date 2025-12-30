"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, ActionResult, PaginatedApiResponse } from "@/types/api";
import type { Comment, CommentFilters } from "./types";

export async function getComments(
    filters: CommentFilters = {}
): Promise<PaginatedApiResponse<Comment>> {
    try {
        const params: Record<string, string | number | undefined> = {
            page: filters.page || 1,
            limit: filters.limit || 10,
        };
        if (filters.filmId) params.filmId = filters.filmId;

        const response = await api.get<PaginatedApiResponse<Comment>>("/comments", params);
        return response;
    } catch (error) {
        console.error("Error fetching comments:", error);
        return {
            success: false,
            timestamp: new Date().toISOString(),
            path: "/comments",
            data: [],
            totalItems: 0,
            totalPages: 0,
            itemsPerPage: 10,
            currentPage: 1,
        };
    }
}

export async function deleteComment(id: string): Promise<ActionResult> {
    try {
        await api.delete(`/comments/${id}`);
        revalidatePath("/comments");
        return {
            success: true,
        };
    } catch (error) {
        console.error("Error deleting comment:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}
