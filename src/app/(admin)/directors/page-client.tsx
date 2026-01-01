"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DirectorTable, DirectorForm } from "@/modules/directors/components";
import type { Director } from "@/modules/directors";
import type { PaginatedApiResponse } from "@/types/api";

interface DirectorsPageClientProps {
    data: PaginatedApiResponse<Director>;
}

export function DirectorsPageClient({ data }: DirectorsPageClientProps) {
    const router = useRouter();
    const [formOpen, setFormOpen] = useState(false);
    const [editingDirector, setEditingDirector] = useState<Director | null>(null);

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
