export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthState {
  success: boolean;
  error?: string;
}

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