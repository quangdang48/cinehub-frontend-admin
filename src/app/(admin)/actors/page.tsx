import { Suspense } from "react";
import { getActors } from "@/modules/actors/actions";
import { ActorsPageClient } from "./page-client";
import { Spinner } from "@/components/ui/spinner";

interface ActorsPageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
        sort?: string;
    }>;
}

export default async function ActorsPage({ searchParams }: ActorsPageProps) {
    const params = await searchParams;

    const filters = {
        page: params.page ? parseInt(params.page) : 1,
        limit: params.limit ? parseInt(params.limit) : 10,
        search: params.search,
        sort: params.sort,
    };

    const actorsData = await getActors(filters);

    return (
        <Suspense fallback={<Spinner />}>
            <ActorsPageClient data={actorsData} />
        </Suspense>
    );
}
