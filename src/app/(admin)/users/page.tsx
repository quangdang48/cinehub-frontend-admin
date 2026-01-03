import { Suspense } from "react";
import { getUsers } from "@/modules/users/actions";
import { Spinner } from "@/components/ui/spinner";
import { UsersPageClient } from "./page-client";

interface UsersPageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
        sort?: string;
    }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
    const params = await searchParams;

    const filters = {
        page: params.page ? parseInt(params.page) : 1,
        limit: params.limit ? parseInt(params.limit) : 10,
        search: params.search || undefined,
        sort: params.sort,
    };

    const usersData = await getUsers(filters);

    return (
        <Suspense fallback={<Spinner />}>
            <UsersPageClient data={usersData} />
        </Suspense>
    );
}
