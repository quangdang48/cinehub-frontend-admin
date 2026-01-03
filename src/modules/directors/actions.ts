'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/errors';
import type {
  ApiResponse,
  ActionResult,
  PaginatedApiResponse,
} from '@/types/api';
import type {
  Director,
  CreateDirectorDto,
  UpdateDirectorDto,
  DirectorFilters,
} from './types';

export async function getDirectors(
  filters: DirectorFilters = {}
): Promise<PaginatedApiResponse<Director>> {
  try {
    const params: Record<string, string | number> = {
      page: filters.page || 1,
      limit: filters.limit || 10,
    };

    if (filters.search) {
      params.search = filters.search;
    }
    if (filters.sort) {
      params.sort = filters.sort;
    }

    const response = await api.get<PaginatedApiResponse<Director>>(
      '/directors',
      params
    );
    return response;
  } catch (error) {
    console.error('Error fetching directors:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      path: '/directors',
      data: [],
      totalItems: 0,
      totalPages: 0,
      itemsPerPage: 10,
      currentPage: 1,
    };
  }
}

export async function getDirectorById(id: string): Promise<Director | null> {
  try {
    const response = await api.get<ApiResponse<Director>>(`/directors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching director:', error);
    return null;
  }
}

export async function createDirector(
  data: CreateDirectorDto
): Promise<ActionResult<Director>> {
  try {
    const response = await api.post<ApiResponse<Director>>('/directors', data);
    revalidatePath('/directors');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error creating director:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function updateDirector(
  id: string,
  data: UpdateDirectorDto
): Promise<ActionResult<Director>> {
  try {
    const response = await api.put<ApiResponse<Director>>(
      `/directors/${id}`,
      data
    );
    revalidatePath('/directors');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error updating director:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function deleteDirector(id: string): Promise<ActionResult> {
  try {
    await api.delete(`/directors/${id}`);
    revalidatePath('/directors');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting director:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
