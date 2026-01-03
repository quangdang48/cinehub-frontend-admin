export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface User {
  id: string;
  name: string;
  email: string;
  gender: Gender;
  role: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  gender: Gender;
  password: string;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  gender: Gender;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
}
