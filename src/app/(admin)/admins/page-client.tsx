"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminTable, AdminForm } from "@/modules/admins/components";
import type { Admin } from "@/modules/admins";
import type { PaginatedApiResponse } from "@/types/api";
import { useDebounce } from "@/hooks/use-debounce";

interface AdminsPageClientProps {
    data: PaginatedApiResponse<Admin>;
}

export function AdminsPageClient({ data }: AdminsPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formOpen, setFormOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
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
        router.push(`/admins?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const handleEdit = (admin: Admin) => {
        setEditingAdmin(admin);
        setFormOpen(true);
    };

    const handleCreate = () => {
        setEditingAdmin(null);
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
                    <h1 className="text-2xl font-bold">Quản lý quản trị viên</h1>
                    <p className="text-muted-foreground">
                        Tổng cộng {data.totalItems} quản trị viên
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm admin
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Table */}
            <AdminTable data={data} onEdit={handleEdit} />

            {/* Form Dialog */}
            <AdminForm
                open={formOpen}
                onOpenChange={setFormOpen}
                admin={editingAdmin}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
