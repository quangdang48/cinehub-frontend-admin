import { User } from "../users";

export interface CommentAuthor {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

export enum ReportReason {
    SPAM = 'SPAM',
    INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
    HARASSMENT = 'HARASSMENT',
    HATE_SPEECH = 'HATE_SPEECH',
    OTHER = 'OTHER',
}

export interface CommentReport {
    id: string;
    reason: ReportReason;
    description?: string;
    user: User;
    commentId: string;
    createdAt: string;
}

export interface Comment {
    id: string;
    content: string;
    totalLikes: number;
    totalDislikes: number;
    totalReplies: number;
    season?: number;
    episode?: number;
    parentId?: string;
    author: CommentAuthor;
    createdAt: string;
    updatedAt: string;
    reports: CommentReport[];
    isReported: boolean;
}

export interface CommentFilters {
    page?: number;
    limit?: number;
    filmId?: string;
    search?: string;
    sort?: string;
}
