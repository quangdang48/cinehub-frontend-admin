// ==================== Navigation ====================
export const SIDEBAR_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { title: 'Quản lý phim', href: '/movies', icon: 'Film' },
  { title: 'Thể loại', href: '/genres', icon: 'Tags' },
  { title: 'Danh mục', href: '/categories', icon: 'FolderTree' },
  { title: 'Gói dịch vụ', href: '/plans', icon: 'CreditCard' },
  { title: 'Người dùng', href: '/users', icon: 'Users' },
  { title: 'Giao dịch', href: '/transactions', icon: 'Receipt' },
  { title: 'Banner', href: '/banners', icon: 'Image' },
  { title: 'Bình luận', href: '/comments', icon: 'MessageSquare' },
  { title: 'Báo cáo', href: '/reports', icon: 'BarChart3' },
  { title: 'Cài đặt', href: '/settings', icon: 'Settings' },
] as const;

// ==================== Status Constants ====================
export const MOVIE_STATUS = {
  published: { label: 'Đã xuất bản', color: 'green' },
  draft: { label: 'Bản nháp', color: 'yellow' },
  coming_soon: { label: 'Sắp ra mắt', color: 'blue' },
} as const;

export const MOVIE_TYPES = [
  { value: 'movie', label: 'Phim lẻ' },
  { value: 'series', label: 'Phim bộ' },
] as const;

export const VIDEO_QUALITY = [
  { value: 'HD', label: 'HD (720p)' },
  { value: 'FHD', label: 'Full HD (1080p)' },
  { value: '4K', label: '4K Ultra HD' },
] as const;

export const AGE_RATINGS = [
  { value: 'P', label: 'P - Mọi đối tượng' },
  { value: 'C13', label: 'C13 - Trên 13 tuổi' },
  { value: 'C16', label: 'C16 - Trên 16 tuổi' },
  { value: 'C18', label: 'C18 - Trên 18 tuổi' },
] as const;

export const TRANSACTION_STATUS = {
  pending: { label: 'Chờ xử lý', color: 'yellow' },
  completed: { label: 'Hoàn thành', color: 'green' },
  failed: { label: 'Thất bại', color: 'red' },
  refunded: { label: 'Đã hoàn tiền', color: 'purple' },
} as const;

export const USER_STATUS = {
  active: { label: 'Hoạt động', color: 'green' },
  inactive: { label: 'Không hoạt động', color: 'gray' },
  banned: { label: 'Bị cấm', color: 'red' },
} as const;

export const USER_ROLES = {
  admin: { label: 'Quản trị viên', color: 'red' },
  moderator: { label: 'Kiểm duyệt viên', color: 'blue' },
  user: { label: 'Người dùng', color: 'gray' },
} as const;

export const BANNER_POSITIONS = [
  { value: 'home_hero', label: 'Hero Banner (Trang chủ)' },
  { value: 'home_banner', label: 'Banner phụ (Trang chủ)' },
  { value: 'category_banner', label: 'Banner danh mục' },
] as const;

// ==================== Pagination ====================
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
