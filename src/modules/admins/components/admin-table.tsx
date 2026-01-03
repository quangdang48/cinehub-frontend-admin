"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { MoreHorizontal, Pencil, Ban, CheckCircle, Mail, Shield } from "lucide-react";
import { banAdmin, unbanAdmin } from "../actions";
import type { Admin, Gender } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableWrapper, type Column } from "@/components/shared/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { PaginatedApiResponse } from "@/types/api";
import { normalizeUrl } from "@/lib/utils";

interface AdminTableProps {
    data: PaginatedApiResponse<Admin>;
    onEdit: (admin: Admin) => void;
}

export function AdminTable({ data, onEdit }: AdminTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    const {
        currentPage,
        pageSize,
        handlePageChange,
        handlePageSizeChange,
        sortConfig,
        handleSort,
        visibleColumns,
        toggleColumn,
    } = useDataTable({
        defaultPageSize: 10,
        defaultVisibleColumns: ["admin", "email", "gender", "status", "createdAt", "actions"],
        baseUrl: "/admins",
    });

    const handleBan = async () => {
        if (!selectedAdmin) return;

        startTransition(async () => {
            const result = await banAdmin(selectedAdmin.id);

            if (result.success) {
                toast.success("Khóa tài khoản admin thành công");
                setBanDialogOpen(false);
                setSelectedAdmin(null);
                router.refresh();
            } else {
                toast.error(result.error || "Không thể khóa tài khoản admin");
            }
        });
    };

    const handleUnban = async () => {
        if (!selectedAdmin) return;

        startTransition(async () => {
            const result = await unbanAdmin(selectedAdmin.id);

            if (result.success) {
                toast.success("Mở khóa tài khoản admin thành công");
                setUnbanDialogOpen(false);
                setSelectedAdmin(null);
                router.refresh();
            } else {
                toast.error(result.error || "Không thể mở khóa tài khoản admin");
            }
        });
    };

    const openBanDialog = (admin: Admin) => {
        setSelectedAdmin(admin);
        setBanDialogOpen(true);
    };

    const openUnbanDialog = (admin: Admin) => {
        setSelectedAdmin(admin);
        setUnbanDialogOpen(true);
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("vi-VN");
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getGenderLabel = (gender: Gender) => {
        return gender === "male" ? "Nam" : "Nữ";
    };

    const columns: Column<Admin>[] = [
        {
            key: "admin",
            title: "Quản trị viên",
            hideable: false,
            render: (admin: Admin) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={admin.avatarUrl ? normalizeUrl(admin.avatarUrl) : undefined} alt={admin.name} />
                        <AvatarFallback className="bg-primary/10">
                            {getInitials(admin.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                        <p className="font-medium">{admin.name}</p>
                        <Shield className="h-4 w-4 text-primary" />
                    </div>
                </div>
            ),
        },
        {
            key: "email",
            title: "Email",
            sortable: true,
            hideable: true,
            render: (admin: Admin) => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{admin.email}</span>
                </div>
            ),
        },
        {
            key: "gender",
            title: "Giới tính",
            hideable: true,
            render: (admin: Admin) => (
                <Badge variant="outline">
                    {getGenderLabel(admin.gender)}
                </Badge>
            ),
        },
        {
            key: "status",
            title: "Trạng thái",
            hideable: true,
            render: (admin: Admin) => (
                <Badge variant={admin.isActive !== false ? "default" : "destructive"}>
                    {admin.isActive !== false ? "Hoạt động" : "Bị khóa"}
                </Badge>
            ),
        },
        {
            key: "createdAt",
            title: "Ngày tạo",
            sortable: true,
            hideable: true,
            render: (admin: Admin) => (
                <span className="text-sm text-muted-foreground">
                    {formatDate(admin.createdAt)}
                </span>
            ),
        },
        {
            key: "actions",
            title: "",
            className: "w-[70px]",
            hideable: false,
            render: (admin: Admin) => (
                <DropdownMenu modal={false}>
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
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(admin);
                            }}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {admin.isActive !== false ? (
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openBanDialog(admin);
                                }}
                            >
                                <Ban className="mr-2 h-4 w-4" />
                                Khóa tài khoản
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                className="text-green-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openUnbanDialog(admin);
                                }}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mở khóa
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <>
            <DataTableWrapper
                data={data}
                columns={columns}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                sortConfig={sortConfig}
                onSort={handleSort}
                visibleColumns={visibleColumns}
                onToggleColumn={toggleColumn}
                onRowClick={onEdit}
                emptyMessage="Không có quản trị viên nào"
                isLoading={isPending}
            />

            {/* Ban Dialog */}
            <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Khóa tài khoản admin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn khóa tài khoản của{" "}
                            <strong>{selectedAdmin?.name}</strong>? Admin này sẽ không thể
                            đăng nhập cho đến khi được mở khóa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBan}
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? "Đang xử lý..." : "Khóa tài khoản"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Unban Dialog */}
            <AlertDialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mở khóa tài khoản?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn mở khóa tài khoản của{" "}
                            <strong>{selectedAdmin?.name}</strong>? Admin này sẽ có thể
                            đăng nhập lại bình thường.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnban}
                            disabled={isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isPending ? "Đang xử lý..." : "Mở khóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
