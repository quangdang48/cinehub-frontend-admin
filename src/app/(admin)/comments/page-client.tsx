"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CommentTable } from "@/modules/comments/components";
import type { Comment } from "@/modules/comments";
import type { PaginatedApiResponse } from "@/types/api";
import { useDebounce } from "@/hooks/use-debounce";

interface CommentsPageClientProps {
    data: PaginatedApiResponse<Comment>;
}

const SORT_OPTIONS = [
    { label: "Mới nhất", value: JSON.stringify({ createdAt: "DESC" }) },
    { label: "Cũ nhất", value: JSON.stringify({ createdAt: "ASC" }) },
    { label: "Nhiều lượt thích nhất", value: JSON.stringify({ totalLikes: "DESC" }) },
    { label: "Nhiều lượt không thích nhất", value: JSON.stringify({ totalDislikes: "DESC" }) },
];

export function CommentsPageClient({ data }: CommentsPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(searchValue, 500);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (debouncedSearch) {
            params.set("search", debouncedSearch);
            params.set("page", "1");
        } else {
            params.delete("search");
        }

        router.push(`/comments?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set("sort", value);
        } else {
            params.delete("sort");
        }
        params.set("page", "1");
        router.push(`/comments?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý bình luận</h1>
                    <p className="text-muted-foreground">
                        Tổng cộng {data.totalItems} bình luận
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm nội dung bình luận..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={searchParams.get("sort") || SORT_OPTIONS[0].value} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <CommentTable data={data} />
        </div>
    );
}
