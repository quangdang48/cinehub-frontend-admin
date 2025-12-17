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
        name: session.user.name,
        email: session.user.email,
      } : undefined}
    >
      {children}
    </AdminLayoutClient>
  );
}
