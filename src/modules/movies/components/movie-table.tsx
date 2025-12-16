"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { deleteMovie, updateMovie } from "../actions";
import { FilmStatus, FilmType, AgeLimit, type Movie, type MoviesResponse } from "../types";
import { normalizeUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

interface MovieTableProps {
  data: MoviesResponse;
}

const statusColors: Record<FilmStatus, string> = {
  [FilmStatus.UPCOMING]: "bg-blue-500",
  [FilmStatus.RELEASING]: "bg-green-500",
  [FilmStatus.ENDED]: "bg-gray-500",
};

const statusLabels: Record<FilmStatus, string> = {
  [FilmStatus.UPCOMING]: "Sắp ra mắt",
  [FilmStatus.RELEASING]: "Đang phát hành",
  [FilmStatus.ENDED]: "Đã kết thúc",
};

const typeLabels: Record<FilmType, string> = {
  [FilmType.MOVIE]: "Phim lẻ",
  [FilmType.SERIES]: "Phim bộ",
};

const ageLimitLabels: Record<AgeLimit, string> = {
  [AgeLimit.ALL]: "Mọi lứa tuổi",
  [AgeLimit.P]: "P",
  [AgeLimit.K]: "K",
  [AgeLimit.T13]: "T13",
  [AgeLimit.T16]: "T16",
  [AgeLimit.T18]: "T18",
};

export function MovieTable({ data }: MovieTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const currentPage = Number(searchParams.get("page")) || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/movies?${params.toString()}`);
  };

  const handleEdit = (movie: Movie) => {
    router.push(`/movies/${movie.id}`);
  };

  const handleDelete = async () => {
    if (!selectedMovie) return;

    startTransition(async () => {
      const result = await deleteMovie(selectedMovie.id);

      if (result.success) {
        toast.success("Xóa phim thành công");
        setDeleteDialogOpen(false);
        setSelectedMovie(null);
        router.refresh();
      } else {
        toast.error(result.error || "Không thể xóa phim");
      }
    });
  };

  const handleToggleStatus = (movie: Movie, newStatus: FilmStatus) => {
    startTransition(async () => {
      const result = await updateMovie(movie.id, { status: newStatus });

      if (result.success) {
        toast.success(`Đã chuyển trạng thái sang ${statusLabels[newStatus]}`);
        router.refresh();
      } else {
        toast.error(result.error || "Không thể cập nhật trạng thái");
      }
    });
  };

  const openDeleteDialog = (movie: Movie) => {
    setSelectedMovie(movie);
    setDeleteDialogOpen(true);
  };

  const formatDate = (timestamp: number | string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("vi-VN");
  };

  const columns: Array<{
    key: string;
    title: string;
    className?: string;
    render?: (item: Movie, index: number) => React.ReactNode;
  }> = [
    {
      key: "poster",
      title: "Poster",
      className: "w-[80px]",
      render: (movie: Movie) => {
        let posterUrl = movie.posters.find(p => p.type === "default")?.url;
        posterUrl = posterUrl ? normalizeUrl(posterUrl) : undefined;
        return (
          <div className="relative h-16 w-12 overflow-hidden rounded">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                No img
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "title",
      title: "Tiêu đề",
      render: (movie: Movie) => (
        <div className="max-w-xs">
          <p className="font-medium truncate">{movie.title}</p>
          {movie.originalTitle && (
            <p className="text-sm text-muted-foreground truncate">{movie.originalTitle}</p>
          )}
          {movie.englishTitle && (
            <p className="text-xs text-muted-foreground truncate">{movie.englishTitle}</p>
          )}
        </div>
      ),
    },
    {
      key: "genres",
      title: "Thể loại",
      render: (movie: Movie) => (
        <div className="flex flex-wrap gap-1">
          {movie.genres?.slice(0, 2).map((genre) => (
            <Badge key={genre.id} variant="outline" className="text-xs">
              {genre.name}
            </Badge>
          ))}
          {(movie.genres?.length || 0) > 2 && (
            <Badge variant="outline" className="text-xs">
              +{(movie.genres?.length || 0) - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "type",
      title: "Loại",
      render: (movie: Movie) => (
        <Badge variant="secondary">
          {typeLabels[movie.type]}
        </Badge>
      ),
    },
    {
      key: "ageLimit",
      title: "Độ tuổi",
      render: (movie: Movie) => (
        <Badge variant="outline" className="text-xs">
          {ageLimitLabels[movie.ageLimit]}
        </Badge>
      ),
    },
    {
      key: "releaseDate",
      title: "Ngày phát hành",
      render: (movie: Movie) => (
        <span className="text-sm">{formatDate(movie.releaseDate)}</span>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (movie: Movie) => (
        <Badge className={statusColors[movie.status]}>
          {statusLabels[movie.status]}
        </Badge>
      ),
    },
    {
      key: "views",
      title: "Lượt xem",
      render: (movie: Movie) => (
        <span className="text-sm">{movie.views?.toLocaleString() || 0}</span>
      ),
    },
    {
      key: "rating",
      title: "Đánh giá",
      render: (movie: Movie) => (
        <div className="flex flex-col gap-1">
          {movie.userRating && (
            <span className="text-xs">
              👤 {movie.userRating.toFixed(1)}
            </span>
          )}
          {movie.imdbRating && (
            <span className="text-xs text-muted-foreground">
              IMDb {movie.imdbRating.toFixed(1)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "",
      className: "w-[70px]",
      render: (movie: Movie) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(movie)}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(`/watch/${movie.id}`, "_blank")}
            >
              <Eye className="mr-2 h-4 w-4" />
              Xem trước
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {movie.status !== FilmStatus.RELEASING && (
              <DropdownMenuItem
                onClick={() => handleToggleStatus(movie, FilmStatus.RELEASING)}
              >
                Đang phát hành
              </DropdownMenuItem>
            )}
            {movie.status !== FilmStatus.UPCOMING && (
              <DropdownMenuItem
                onClick={() => handleToggleStatus(movie, FilmStatus.UPCOMING)}
              >
                Sắp ra mắt
              </DropdownMenuItem>
            )}
            {movie.status !== FilmStatus.ENDED && (
              <DropdownMenuItem
                onClick={() => handleToggleStatus(movie, FilmStatus.ENDED)}
              >
                Đã kết thúc
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => openDeleteDialog(movie)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div className="relative">
          {isPending && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 rounded-lg">
              <Spinner />
            </div>
          )}

          <div className="rounded-md border">
            <DataTable
              columns={columns}
              data={data.data}
              emptyMessage="Không tìm thấy phim nào"
              onRowClick={handleEdit}
            />
          </div>

          {data.totalPages > 1 && (
            <div className="p-4 border-t">
              <DataTablePagination
                currentPage={currentPage}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn phim &quot;{selectedMovie?.title}&quot;.
              Không thể hoàn tác sau khi xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
