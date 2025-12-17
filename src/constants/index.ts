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

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
