import { ReportReason } from "../comments/types";
import { User } from "../users";

export interface ReviewAuthor {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

export interface ReviewReport {
    id: string;
    reason: ReportReason;
    description?: string;
    user: User;
    reviewId: string;
    createdAt: string;
}

export interface Review {
    id: string;
    content: string;
    rating: number;
    totalLikes: number;
    totalDislikes: number;
    totalComments: number;
    author: ReviewAuthor;
    filmId: string;
    createdAt: string;
    updatedAt: string;
    reports: ReviewReport[];
    isReported: boolean;
}

export interface ReviewFilters {
    page?: number;
    limit?: number;
    filmId?: string;
    search?: string;
    sort?: string;
}
