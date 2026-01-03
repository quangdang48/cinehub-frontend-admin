"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DirectorTable, DirectorForm } from "@/modules/directors/components";
import type { Director } from "@/modules/directors";
import type { PaginatedApiResponse } from "@/types/api";
import { useDebounce } from "@/hooks/use-debounce";

interface DirectorsPageClientProps {
    data: PaginatedApiResponse<Director>;
}

export function DirectorsPageClient({ data }: DirectorsPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formOpen, setFormOpen] = useState(false);
    const [editingDirector, setEditingDirector] = useState<Director | null>(null);
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
        router.push(`/directors?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const handleEdit = (director: Director) => {
        setEditingDirector(director);
        setFormOpen(true);
    };

    const handleCreate = () => {
        setEditingDirector(null);
        setFormOpen(true);
    };

    const handleSuccess = () => {
        router.refresh();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý đạo diễn</h1>
                    <p className="text-muted-foreground">
                        Tổng cộng {data.totalItems} đạo diễn
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm đạo diễn
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm đạo diễn..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Table */}
            <DirectorTable data={data} onEdit={handleEdit} />

            {/* Form Dialog */}
            <DirectorForm
                open={formOpen}
                onOpenChange={setFormOpen}
                director={editingDirector}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
