"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenreTable, GenreForm } from "@/modules/genres/components";
import type { Genre } from "@/modules/genres";
import type { PaginatedApiResponse } from "@/types/api";

interface GenresPageClientProps {
    data: PaginatedApiResponse<Genre>;
}

export function GenresPageClient({ data }: GenresPageClientProps) {
    const router = useRouter();
    const [formOpen, setFormOpen] = useState(false);
    const [editingGenre, setEditingGenre] = useState<Genre | null>(null);

    const handleEdit = (genre: Genre) => {
        setEditingGenre(genre);
        setFormOpen(true);
    };

    const handleCreate = () => {
        setEditingGenre(null);
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
                    <h1 className="text-2xl font-bold">Quản lý thể loại</h1>
                    <p className="text-muted-foreground">
                        Tổng cộng {data.totalItems} thể loại
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm thể loại
                </Button>
            </div>

            {/* Table */}
            <GenreTable data={data} onEdit={handleEdit} />

            {/* Form Dialog */}
            <GenreForm
                open={formOpen}
                onOpenChange={setFormOpen}
                genre={editingGenre}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
