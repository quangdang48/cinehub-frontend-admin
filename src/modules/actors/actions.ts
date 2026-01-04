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
  Actor,
  CreateActorDto,
  UpdateActorDto,
  ActorFilters,
} from './types';

export async function getActors(
  filters: ActorFilters = {}
): Promise<PaginatedApiResponse<Actor>> {
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

    const response = await api.get<PaginatedApiResponse<Actor>>(
      '/actors',
      params
    );
    return response;
  } catch (error) {
    console.error('Error fetching actors:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      path: '/actors',
      data: [],
      totalItems: 0,
      totalPages: 0,
      itemsPerPage: 10,
      currentPage: 1,
    };
  }
}

export async function getActorById(id: string): Promise<Actor | null> {
  try {
    const response = await api.get<ApiResponse<Actor>>(`/actors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching actor:', error);
    return null;
  }
}

export async function createActor(
  data: FormData
): Promise<ActionResult<Actor>> {
  try {
    const response = await api.post<ApiResponse<Actor>>('/actors', data);
    revalidatePath('/actors');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error creating actor:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function updateActor(
  id: string,
  data: FormData
): Promise<ActionResult<Actor>> {
  try {
    const response = await api.put<ApiResponse<Actor>>(`/actors/${id}`, data);
    revalidatePath('/actors');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error updating actor:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function deleteActor(id: string): Promise<ActionResult> {
  try {
    await api.delete(`/actors/${id}`);
    revalidatePath('/actors');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting actor:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
