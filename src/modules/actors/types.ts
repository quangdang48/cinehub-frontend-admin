export interface Actor {
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

export interface CreateActorDto {
  name: string;
  gender?: 'male' | 'female' | null;
  bio?: string | null;
  birthDate?: string | null;
  nationality?: string | null;
}

export interface UpdateActorDto {
  name: string;
  gender?: 'male' | 'female' | null;
  bio?: string | null;
  birthDate?: string | null;
  nationality?: string | null;
}

export interface ActorFilters {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}
