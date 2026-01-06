"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserTable, UserForm } from "@/modules/users/components";
import type { User } from "@/modules/users";
import type { PaginatedApiResponse } from "@/types/api";
import { useDebounce } from "@/hooks/use-debounce";

interface UsersPageClientProps {
    data: PaginatedApiResponse<User>;
}

export function UsersPageClient({ data }: UsersPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formOpen, setFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
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
        router.push(`/users?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const handleEdit = (user: User) => {
        setEditingUser(user);
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
                    <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
                    <p className="text-muted-foreground">
                        Tổng cộng {data.totalItems} người dùng
                    </p>
                </div>
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
            <UserTable data={data} onEdit={handleEdit} />

            {/* Form Dialog */}
            <UserForm
                open={formOpen}
                onOpenChange={setFormOpen}
                user={editingUser}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
