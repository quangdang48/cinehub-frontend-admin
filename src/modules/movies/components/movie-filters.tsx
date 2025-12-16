"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { FilmStatus, FilmType, AgeLimit, type Genre } from "../types";

interface MovieFiltersProps {
  genres: Genre[];
}

const statusOptions: { value: FilmStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: FilmStatus.UPCOMING, label: "Sắp ra mắt" },
  { value: FilmStatus.RELEASING, label: "Đang phát hành" },
  { value: FilmStatus.ENDED, label: "Đã kết thúc" },
];

const typeOptions: { value: FilmType | "all"; label: string }[] = [
  { value: "all", label: "Tất cả loại" },
  { value: FilmType.MOVIE, label: "Phim lẻ" },
  { value: FilmType.SERIES, label: "Phim bộ" },
];

const ageLimitOptions: { value: AgeLimit | "all"; label: string }[] = [
  { value: "all", label: "Tất cả độ tuổi" },
  { value: AgeLimit.ALL, label: "Mọi lứa tuổi" },
  { value: AgeLimit.P, label: "P - Phổ thông" },
  { value: AgeLimit.K, label: "K - Dưới 13 tuổi" },
  { value: AgeLimit.T13, label: "T13 - Từ 13 tuổi" },
  { value: AgeLimit.T16, label: "T16 - Từ 16 tuổi" },
  { value: AgeLimit.T18, label: "T18 - Từ 18 tuổi" },
];

export function MovieFilters({ genres }: MovieFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const currentFilters = {
    status: searchParams.get("status") || "all",
    type: searchParams.get("type") || "all",
    ageLimit: searchParams.get("ageLimit") || "all",
    genreId: searchParams.get("genreId") || "all",
    country: searchParams.get("country") || "",
  };

  const hasActiveFilters =
    currentFilters.status !== "all" ||
    currentFilters.type !== "all" ||
    currentFilters.ageLimit !== "all" ||
    currentFilters.genreId !== "all" ||
    currentFilters.country !== "" ||
    search;

  const updateFilter = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      
      // Reset to page 1 when filters change
      params.set("page", "1");
      
      router.push(`/movies?${params.toString()}`);
    });
  };

  const handleSearch = () => {
    updateFilter("search", search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSearch("");
    startTransition(() => {
      router.push("/movies");
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and quick filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search input */}
        <div className="flex flex-1 min-w-50 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm phim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} disabled={isPending}>
            Tìm
          </Button>
        </div>

        {/* Status filter */}
        <Select
          value={currentFilters.status}
          onValueChange={(value) => updateFilter("status", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type filter */}
        <Select
          value={currentFilters.type}
          onValueChange={(value) => updateFilter("type", value)}
        >
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Loại phim" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Age Limit filter */}
        <Select
          value={currentFilters.ageLimit}
          onValueChange={(value) => updateFilter("ageLimit", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Độ tuổi" />
          </SelectTrigger>
          <SelectContent>
            {ageLimitOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Genre filter */}
        <Select
          value={currentFilters.genreId}
          onValueChange={(value) => updateFilter("genreId", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Thể loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thể loại</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre.id} value={genre.id}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} disabled={isPending}>
            <X className="mr-2 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Đang lọc:</span>
          {search && (
            <Badge variant="secondary">
              Tìm kiếm: {search}
              <button
                onClick={() => {
                  setSearch("");
                  updateFilter("search", "");
                }}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.status !== "all" && (
            <Badge variant="secondary">
              {statusOptions.find((s) => s.value === currentFilters.status)?.label}
              <button
                onClick={() => updateFilter("status", "all")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.type !== "all" && (
            <Badge variant="secondary">
              {typeOptions.find((t) => t.value === currentFilters.type)?.label}
              <button
                onClick={() => updateFilter("type", "all")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.ageLimit !== "all" && (
            <Badge variant="secondary">
              {ageLimitOptions.find((a) => a.value === currentFilters.ageLimit)?.label}
              <button
                onClick={() => updateFilter("ageLimit", "all")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.genreId !== "all" && (
            <Badge variant="secondary">
              {genres.find((g) => g.id === currentFilters.genreId)?.name}
              <button
                onClick={() => updateFilter("genreId", "all")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
