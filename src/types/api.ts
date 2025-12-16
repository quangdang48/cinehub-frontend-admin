// ==================== API Response Types ====================
export type ApiResponse<T> = {
  success: boolean;
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


// ==================== Auth Types ====================

export interface UserDto {
  id: string;
  email: string;
  name: string;
  gender: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

// ==================== Action Result Types ====================

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
