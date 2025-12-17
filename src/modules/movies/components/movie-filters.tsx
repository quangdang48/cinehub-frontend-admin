"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { type Genre } from "../types";
import { typeOptions, statusOptions, ageLimitOptions } from "../const";

interface MovieFiltersProps {
  genres: Genre[];
}

export function MovieFilters({ genres }: MovieFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const currentFilters = {
    status: searchParams.get("status") || "",
    type: searchParams.get("type") || "",
    ageLimit: searchParams.get("ageLimit") || "",
    genreId: searchParams.get("genreId") || "",
    country: searchParams.get("country") || "",
  };

  const hasActiveFilters =
    currentFilters.status ||
    currentFilters.type ||
    currentFilters.ageLimit ||
    currentFilters.genreId ||
    currentFilters.country ||
    search;

  const updateFilter = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (!value) {
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
          <SelectTrigger id="status-filter  " className='w-35'>
            <SelectValue placeholder='Trạng thái' />
          </SelectTrigger>
          <SelectContent className='data-[state=open]:slide-in-from-bottom-8 data-[state=open]:zoom-in-100 duration-400'>
            <SelectGroup>
              <SelectLabel>Trạng thái</SelectLabel>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
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
          <SelectContent className='data-[state=open]:slide-in-from-bottom-8 data-[state=open]:zoom-in-100 duration-400'>
            <SelectGroup>
              <SelectLabel>Loại phim</SelectLabel>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
            </SelectGroup>
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
              <SelectGroup>
                <SelectLabel>Độ tuổi</SelectLabel>
                  {ageLimitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectGroup>
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
            <SelectGroup>
              <SelectLabel>Thể loại</SelectLabel>
                {genres.map((genre) => (
                  <SelectItem key={genre.id} value={genre.id}>
                    {genre.name}
                  </SelectItem>
                ))}
            </SelectGroup>
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
          {currentFilters.status&& (
            <Badge variant="secondary">
              {statusOptions.find((s) => s.value === currentFilters.status)?.label}
              <button
                onClick={() => updateFilter("status", "")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.type&& (
            <Badge variant="secondary">
              {typeOptions.find((t) => t.value === currentFilters.type)?.label}
              <button
                onClick={() => updateFilter("type", "")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.ageLimit&& (
            <Badge variant="secondary">
              {ageLimitOptions.find((a) => a.value === currentFilters.ageLimit)?.label}
              <button
                onClick={() => updateFilter("ageLimit", "")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.genreId&& (
            <Badge variant="secondary">
              {genres.find((g) => g.id === currentFilters.genreId)?.name}
              <button
                onClick={() => updateFilter("genreId", "")}
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
