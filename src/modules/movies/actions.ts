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
  Season,
  Episode,
  CreateSeasonDto,
  CreateEpisodeDto,
} from "./types";

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
  data: CreateMovieDto
): Promise<ActionResult<Movie>> {
  try {
    const response = await api.post<ApiResponse<Movie>>("/films", data);
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
  data: UpdateMovieDto
): Promise<ActionResult<Movie>> {
  try {
    const response = await api.put<ApiResponse<Movie>>(`/films/${id}`, data);
    revalidatePath("/movies");
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

export async function getSeasons(filmId: string): Promise<Season[]> {
  try {
    // First call to get total count
    const firstResponse = await api.get<PaginatedApiResponse<Season>>(
      `/films/${filmId}/seasons`,
      { limit: 1, page: 1 }
    );
    
    if (firstResponse.totalItems === 0) {
      return [];
    }
    
    // Second call to get all seasons
    const response = await api.get<PaginatedApiResponse<Season>>(
      `/films/${filmId}/seasons`,
      { limit: firstResponse.totalItems, page: 1 }
    );
    
    // Load episodes for each season
    const seasonsWithEpisodes = await Promise.all(
      response.data.map(async (season) => {
        const episodes = await getEpisodes(filmId, season.number);
        return { ...season, episodes };
      })
    );
    
    return seasonsWithEpisodes;
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }
}

export async function getEpisodes(
  filmId: string,
  seasonNumber: number
): Promise<Episode[]> {
  try {
    // First call to get total count
    const firstResponse = await api.get<PaginatedApiResponse<Episode>>(
      `/films/${filmId}/seasons/${seasonNumber}/episodes`,
      { limit: 1, page: 1 }
    );
    
    if (firstResponse.totalItems === 0) {
      return [];
    }
    
    // Second call to get all episodes
    const response = await api.get<PaginatedApiResponse<Episode>>(
      `/films/${filmId}/seasons/${seasonNumber}/episodes`,
      { limit: firstResponse.totalItems, page: 1 }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
}

export async function createSeason(
  filmId: string,
  data: CreateSeasonDto
): Promise<ActionResult<Season>> {
  try {
    const response = await api.post<ApiResponse<Season>>(
      `/films/${filmId}/seasons`,
      data
    );
    revalidatePath(`/movies/${filmId}/edit`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating season:", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function createEpisode(
  filmId: string,
  seasonNumber: number,
  data: CreateEpisodeDto
): Promise<ActionResult<Episode>> {
  try {
    const response = await api.post<ApiResponse<Episode>>(
      `/films/${filmId}/seasons/${seasonNumber}/episodes`,
      data
    );
    revalidatePath(`/movies/${filmId}/edit`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating episode:", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
