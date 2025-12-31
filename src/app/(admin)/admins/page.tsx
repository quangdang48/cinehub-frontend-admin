import { Suspense } from "react";
import { getAdmins } from "@/modules/admins/actions";
import { Spinner } from "@/components/ui/spinner";
import { AdminsPageClient } from "./page-client";

interface AdminsPageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
    }>;
}

export default async function AdminsPage({ searchParams }: AdminsPageProps) {
    const params = await searchParams;

    const filters = {
        page: params.page ? parseInt(params.page) : 1,
        limit: params.limit ? parseInt(params.limit) : 10,
        search: params.search || undefined,
    };

    const adminsData = await getAdmins(filters);

    return (
        <Suspense fallback={<Spinner />}>
            <AdminsPageClient data={adminsData} />
        </Suspense>
    );
}
