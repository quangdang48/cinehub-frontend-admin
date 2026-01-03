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
import { MoreHorizontal, Pencil, Ban, CheckCircle, Mail, User as UserIcon } from "lucide-react";
import { banUser, unbanUser } from "../actions";
import type { User, Gender } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableWrapper, type Column } from "@/components/shared/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { PaginatedApiResponse } from "@/types/api";
import { normalizeUrl } from "@/lib/utils";

interface UserTableProps {
    data: PaginatedApiResponse<User>;
    onEdit: (user: User) => void;
}

export function UserTable({ data, onEdit }: UserTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
        defaultVisibleColumns: ["user", "email", "gender", "status", "createdAt", "actions"],
        baseUrl: "/users",
    });

    const handleBan = async () => {
        if (!selectedUser) return;

        startTransition(async () => {
            const result = await banUser(selectedUser.id);

            if (result.success) {
                toast.success("Khóa người dùng thành công");
                setBanDialogOpen(false);
                setSelectedUser(null);
                router.refresh();
            } else {
                toast.error(result.error || "Không thể khóa người dùng");
            }
        });
    };

    const handleUnban = async () => {
        if (!selectedUser) return;

        startTransition(async () => {
            const result = await unbanUser(selectedUser.id);

            if (result.success) {
                toast.success("Mở khóa người dùng thành công");
                setUnbanDialogOpen(false);
                setSelectedUser(null);
                router.refresh();
            } else {
                toast.error(result.error || "Không thể mở khóa người dùng");
            }
        });
    };

    const openBanDialog = (user: User) => {
        setSelectedUser(user);
        setBanDialogOpen(true);
    };

    const openUnbanDialog = (user: User) => {
        setSelectedUser(user);
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

    const columns: Column<User>[] = [
        {
            key: "user",
            title: "Người dùng",
            hideable: false,
            render: (user: User) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl ? normalizeUrl(user.avatarUrl) : undefined} alt={user.name} />
                        <AvatarFallback className="bg-primary/10">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{user.name}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "email",
            title: "Email",
            sortable: true,
            hideable: true,
            render: (user: User) => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                    {user.isVerified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                </div>
            ),
        },
        {
            key: "gender",
            title: "Giới tính",
            hideable: true,
            render: (user: User) => (
                <Badge variant="outline">
                    {getGenderLabel(user.gender)}
                </Badge>
            ),
        },
        {
            key: "status",
            title: "Trạng thái",
            hideable: true,
            render: (user: User) => (
                <Badge variant={user.isActive !== false ? "default" : "destructive"}>
                    {user.isActive !== false ? "Hoạt động" : "Bị khóa"}
                </Badge>
            ),
        },
        {
            key: "createdAt",
            title: "Ngày tạo",
            sortable: true,
            hideable: true,
            render: (user: User) => (
                <span className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                </span>
            ),
        },
        {
            key: "actions",
            title: "",
            className: "w-[70px]",
            hideable: false,
            render: (user: User) => (
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
                                onEdit(user);
                            }}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.isActive !== false ? (
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openBanDialog(user);
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
                                    openUnbanDialog(user);
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
                emptyMessage="Không có người dùng nào"
                isLoading={isPending}
            />

            {/* Ban Dialog */}
            <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Khóa tài khoản người dùng?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn khóa tài khoản của{" "}
                            <strong>{selectedUser?.name}</strong>? Người dùng sẽ không thể
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
                            <strong>{selectedUser?.name}</strong>? Người dùng sẽ có thể
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
