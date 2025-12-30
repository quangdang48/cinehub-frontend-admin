import { Suspense } from "react";
import { getGenres } from "@/modules/genres/actions";
import { GenresPageClient } from "./page-client";
import { Spinner } from "@/components/ui/spinner";

interface GenresPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default async function GenresPage({ searchParams }: GenresPageProps) {
  const params = await searchParams;

  const filters = {
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 10,
  };

  const genresData = await getGenres(filters);

  return (
    <Suspense fallback={<Spinner />}>
      <GenresPageClient data={genresData} />
    </Suspense>
  );
}
