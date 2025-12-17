"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import type { ApiResponse, ActionResult, PaginatedApiResponse } from "@/types/api";
import type {
  Movie,
  CreateMovieDto,
  UpdateMovieDto,
  MovieFilters,
  Genre,
  Director,
  Actor,
} from "./types";
import { movieSchema } from "./schemas";

export async function getMovies(
  filters: MovieFilters = {}
): Promise<PaginatedApiResponse<Movie>> {
  try {
    const params: Record<string, string | number | boolean | undefined> = {
      page: filters.page || 1,
      limit: filters.limit || 10,
    };

    if (filters.search) params.search = filters.search;
    if (filters.country) params.country = filters.country;
    if (filters.releaseYear) params.releaseYear = filters.releaseYear;
    if (filters.genreId) params.genreId = filters.genreId;
    if (filters.directorId) params.directorId = filters.directorId;
    if (filters.actorId) params.actorId = filters.actorId;
    if (filters.status) params.status = filters.status;
    if (filters.type) params.type = filters.type;
    if (filters.ageLimit) params.ageLimit = filters.ageLimit;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    const response = await api.get<PaginatedApiResponse<Movie>>("/films", params);
    return response;
  } catch (error) {
    console.error("Error fetching movies:", error);
    // Return empty data on error
    return {
      success: false,
      timestamp: new Date().toISOString(),
      path: "/films",
      data: [],
      totalItems: 0,
      totalPages: 0,
      itemsPerPage: 10,
      currentPage: 1,
    };
  }
}

export async function getMovieById(id: string): Promise<Movie | null> {
  try {
    const response = await api.get<ApiResponse<Movie>>(`/films/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching movie:", error);
    return null;
  }
}

export async function getGenres(): Promise<Genre[]> {
  try {
    const response = await api.get<PaginatedApiResponse<Genre>>("/genres", {
      limit: 100,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
}

export async function getDirectors(): Promise<Director[]> {
  try {
    const response = await api.get<PaginatedApiResponse<Director>>("/directors", {
      limit: 100,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching directors:", error);
    return [];
  }
}

export async function getActors(): Promise<Actor[]> {
  try {
    const response = await api.get<PaginatedApiResponse<Actor>>("/actors", {
      limit: 100,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching actors:", error);
    return [];
  }
}

export async function createMovie(
  formData: CreateMovieDto
): Promise<ActionResult<Movie>> {
  try {
    const validatedData = movieSchema.parse(formData);
    const createDto: CreateMovieDto = {
      title: validatedData.title,
      originalTitle: validatedData.originalTitle,
      englishTitle: validatedData.englishTitle,
      description: validatedData.description || undefined,
      ageLimit: validatedData.ageLimit,
      country: validatedData.country,
      releaseDate: validatedData.releaseDate,
      status: validatedData.status,
      type: validatedData.type,
      directors: validatedData.directors,
      casts: validatedData.casts,
      genres: validatedData.genres,
    };
    const response = await api.post<ApiResponse<Movie>>("/films", createDto);
    revalidatePath("/movies");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating movie:", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function updateMovie(
  id: string,
  formData: Partial<UpdateMovieDto>
): Promise<ActionResult<Movie>> {
  try {
    const response = await api.put<ApiResponse<Movie>>(
      `/films/${id}`,
      formData
    );
    revalidatePath(`/movies/${id}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error updating movie:", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function deleteMovie(id: string): Promise<ActionResult> {
  try {
    await api.delete(`/films/${id}`);
    revalidatePath("/movies");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting movie:", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
