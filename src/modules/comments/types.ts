export interface CommentAuthor {
    id: string;
    name: string;
    email: string;
    avatar?: string;
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
}

export interface CommentFilters {
    page?: number;
    limit?: number;
    filmId?: string;
}
