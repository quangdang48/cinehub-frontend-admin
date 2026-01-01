export interface Director {
  id: string;
  name: string;
  gender: 'male' | 'female' | null;
  bio: string | null;
  birthDate: string | null;
  nationality: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDirectorDto {
  name: string;
  gender?: 'male' | 'female' | null;
  bio?: string | null;
  birthDate?: string | null;
  nationality?: string | null;
}

export interface UpdateDirectorDto {
  name: string;
  gender?: 'male' | 'female' | null;
  bio?: string | null;
  birthDate?: string | null;
  nationality?: string | null;
}

export interface DirectorFilters {
  page?: number;
  limit?: number;
  search?: string;
}
