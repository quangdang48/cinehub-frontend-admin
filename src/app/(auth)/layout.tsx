import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập - CineHub Admin",
  description: "Đăng nhập vào trang quản trị CineHub",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      {children}
    </div>
  );
}
