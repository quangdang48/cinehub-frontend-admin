export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  errors?: Record<string, any>;
  timestamp: string;
  path: string;
  data: T;
};

export type PaginatedApiResponse<T> = Omit<ApiResponse<T>, "data"> & {
  data: Array<T>;
  totalItems: number;
  totalPages: number;
  itemsPerPage: number;
  currentPage: number;
};

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
