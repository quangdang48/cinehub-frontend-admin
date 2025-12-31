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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { deleteGenre } from "../actions";
import type { Genre } from "../types";
import { Button } from "@/components/ui/button";
import { DataTableWrapper, type Column } from "@/components/shared/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { PaginatedApiResponse } from "@/types/api";

interface GenreTableProps {
    data: PaginatedApiResponse<Genre>;
    onEdit: (genre: Genre) => void;
}

export function GenreTable({ data, onEdit }: GenreTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

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
        defaultVisibleColumns: ["name", "slug", "createdAt", "updatedAt", "actions"],
        baseUrl: "/genres",
    });

    const handleDelete = async () => {
        if (!selectedGenre) return;

        startTransition(async () => {
            const result = await deleteGenre(selectedGenre.id);

            if (result.success) {
                toast.success("Xóa thể loại thành công");
                setDeleteDialogOpen(false);
                setSelectedGenre(null);
                router.refresh();
            } else {
                toast.error(result.error || "Không thể xóa thể loại");
            }
        });
    };

    const openDeleteDialog = (genre: Genre) => {
        setSelectedGenre(genre);
        setDeleteDialogOpen(true);
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("vi-VN");
    };

    const columns: Column<Genre>[] = [
        {
            key: "name",
            title: "Tên thể loại",
            sortable: true,
            hideable: false,
            render: (genre: Genre) => (
                <span className="font-medium">{genre.name}</span>
            ),
        },
        {
            key: "slug",
            title: "Slug",
            sortable: true,
            hideable: true,
            render: (genre: Genre) => (
                <span className="text-muted-foreground">{genre.slug}</span>
            ),
        },
        {
            key: "createdAt",
            title: "Ngày tạo",
            sortable: true,
            hideable: true,
            render: (genre: Genre) => (
                <span className="text-sm text-muted-foreground">
                    {formatDate(genre.createdAt)}
                </span>
            ),
        },
        {
            key: "updatedAt",
            title: "Cập nhật lần cuối",
            sortable: true,
            hideable: true,
            render: (genre: Genre) => (
                <span className="text-sm text-muted-foreground">
                    {formatDate(genre.updatedAt)}
                </span>
            ),
        },
        {
            key: "actions",
            title: "",
            className: "w-[70px]",
            hideable: false,
            render: (genre: Genre) => (
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
                                onEdit(genre);
                            }}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(genre);
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                        </DropdownMenuItem>
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
                emptyMessage="Không có thể loại nào"
                isLoading={isPending}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này sẽ xóa vĩnh viễn thể loại &quot;
                            {selectedGenre?.name}&quot;. Không thể hoàn tác sau khi xóa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
