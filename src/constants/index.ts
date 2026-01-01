// ==================== Navigation ====================
export const SIDEBAR_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { title: 'Quản lý phim', href: '/movies', icon: 'Film' },
  { title: 'Thể loại', href: '/genres', icon: 'Tags' },
  { title: 'Diễn viên', href: '/actors', icon: 'UserCircle' },
  { title: 'Đạo diễn', href: '/directors', icon: 'Clapperboard' },
  { title: 'Gói dịch vụ', href: '/plans', icon: 'CreditCard' },
  { title: 'Người dùng', href: '/users', icon: 'Users' },
  { title: 'Quản trị viên', href: '/admins', icon: 'Admins' },
  { title: 'Giao dịch', href: '/transactions', icon: 'Receipt' },
  { title: 'Bình luận', href: '/comments', icon: 'MessageSquare' },
  { title: 'Cài đặt', href: '/settings', icon: 'Settings' },
] as const;

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
