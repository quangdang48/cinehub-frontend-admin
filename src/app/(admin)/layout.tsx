import { auth } from "@/modules/auth/auth";
import { AdminLayoutClient } from "./layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <AdminLayoutClient
      user={session?.user ? {
        fullName: session.user.fullName,
        email: session.user.email,
        avatar: session.user.avatar,
      } : undefined}
    >
      {children}
    </AdminLayoutClient>
  );
}
