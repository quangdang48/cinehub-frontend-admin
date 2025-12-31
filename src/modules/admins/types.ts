export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  gender: Gender;
  role: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminDto {
  name: string;
  email: string;
  gender: Gender;
  password: string;
}

export interface UpdateAdminDto {
  name: string;
  email: string;
  gender: Gender;
}

export interface AdminFilters {
  page?: number;
  limit?: number;
  search?: string;
}
