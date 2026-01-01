"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActorTable, ActorForm } from "@/modules/actors/components";
import type { Actor } from "@/modules/actors";
import type { PaginatedApiResponse } from "@/types/api";

interface ActorsPageClientProps {
    data: PaginatedApiResponse<Actor>;
}

export function ActorsPageClient({ data }: ActorsPageClientProps) {
    const router = useRouter();
    const [formOpen, setFormOpen] = useState(false);
    const [editingActor, setEditingActor] = useState<Actor | null>(null);

    const handleEdit = (actor: Actor) => {
        setEditingActor(actor);
        setFormOpen(true);
    };

    const handleCreate = () => {
        setEditingActor(null);
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
                    <h1 className="text-2xl font-bold">Quản lý diễn viên</h1>
                    <p className="text-muted-foreground">
                        Tổng cộng {data.totalItems} diễn viên
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm diễn viên
                </Button>
            </div>

            {/* Table */}
            <ActorTable data={data} onEdit={handleEdit} />

            {/* Form Dialog */}
            <ActorForm
                open={formOpen}
                onOpenChange={setFormOpen}
                actor={editingActor}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
