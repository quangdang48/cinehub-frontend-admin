import { Suspense } from "react";
import { getDirectors } from "@/modules/directors/actions";
import { DirectorsPageClient } from "./page-client";
import { Spinner } from "@/components/ui/spinner";

interface DirectorsPageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
    }>;
}

export default async function DirectorsPage({ searchParams }: DirectorsPageProps) {
    const params = await searchParams;

    const filters = {
        page: params.page ? parseInt(params.page) : 1,
        limit: params.limit ? parseInt(params.limit) : 10,
        search: params.search,
    };

    const directorsData = await getDirectors(filters);

    return (
        <Suspense fallback={<Spinner />}>
            <DirectorsPageClient data={directorsData} />
        </Suspense>
    );
}
