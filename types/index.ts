// ==================== User Types ====================
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'inactive' | 'banned';
  subscriptionId?: string;
  subscription?: Subscription;
  createdAt: string;
  updatedAt: string;
}

// ==================== Movie/Video Types ====================
export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  slug: string;
  description: string;
  poster: string;
  backdrop?: string;
  trailer?: string;
  videoUrl?: string; // URL video chính (cho phim lẻ)
  duration?: number; // minutes
  releaseYear?: number;
  genres: Genre[];
  categories: Category[];
  director?: string;
  cast?: string[];
  country?: string;
  language?: string;
  subtitles?: string[];
  quality?: 'HD' | 'FHD' | '4K';
  ageRating?: string;
  rating?: number;
  viewCount?: number;
  isFeatured?: boolean;
  isPremium?: boolean;
  type: 'movie' | 'series';
  status: 'published' | 'draft' | 'coming_soon';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Episode Types (cho Series) ====================
export interface Episode {
  id: string;
  movieId: string;
  movie?: Movie;
  season: number;
  episodeNumber: number;
  title: string;
  description?: string;
  thumbnail?: string;
  videoUrl: string;
  duration: number;
  viewCount?: number;
  status: 'published' | 'draft';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Genre Types ====================
export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Category Types ====================
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== Subscription/Plan Types ====================
export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  duration: number; // days
  features: string[];
  maxDevices?: number;
  quality?: 'HD' | 'FHD' | '4K';
  isPopular?: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  user?: User;
  planId: string;
  plan?: Plan;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ==================== Transaction Types ====================
export interface Transaction {
  id: string;
  transactionCode: string;
  userId: string;
  user?: User;
  planId: string;
  plan?: Plan;
  amount: number;
  paymentMethod: 'card' | 'momo' | 'vnpay' | 'zalopay' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

// ==================== Banner Types ====================
export interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  movieId?: string;
  movie?: Movie;
  position: 'home_hero' | 'home_banner' | 'category_banner';
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Comment Types ====================
export interface Comment {
  id: string;
  userId: string;
  user?: User;
  movieId: string;
  movie?: Movie;
  content: string;
  rating?: number;
  likes?: number;
  status: 'visible' | 'hidden' | 'reported';
  createdAt: string;
  updatedAt: string;
}

// ==================== Dashboard Stats Types ====================
export interface DashboardStats {
  totalRevenue: number;
  totalSubscribers: number;
  totalUsers: number;
  totalMovies: number;
  totalViews: number;
  revenueChange: number;
  subscribersChange: number;
  viewsChange: number;
}

// ==================== API Response Types ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== Form Types ====================
export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}
