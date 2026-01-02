import { AdminLayoutClient } from "./layout-client";
import { SessionProvider } from "next-auth/react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </SessionProvider>
  );
}
