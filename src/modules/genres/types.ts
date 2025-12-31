export interface Genre {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateGenreDto {
    name: string;
    slug: string;
}

export interface UpdateGenreDto {
    name?: string;
    slug?: string;
}

export interface GenreFilters {
    page?: number;
    limit?: number;
}
