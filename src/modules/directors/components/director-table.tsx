"use client";

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
import { deleteDirector } from "../actions";
import type { Director } from "../types";
import { Button } from "@/components/ui/button";
import { DataTableWrapper, type Column } from "@/components/shared/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { PaginatedApiResponse } from "@/types/api";
import { Badge } from "@/components/ui/badge";

interface DirectorTableProps {
    data: PaginatedApiResponse<Director>;
    onEdit: (director: Director) => void;
}

export function DirectorTable({ data, onEdit }: DirectorTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDirector, setSelectedDirector] = useState<Director | null>(null);

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
        defaultVisibleColumns: ["name", "gender", "nationality", "birthDate", "createdAt", "actions"],
        baseUrl: "/directors",
    });

    const handleDelete = async () => {
        if (!selectedDirector) return;

        startTransition(async () => {
            const result = await deleteDirector(selectedDirector.id);

            if (result.success) {
                toast.success("Xóa đạo diễn thành công");
                setDeleteDialogOpen(false);
                setSelectedDirector(null);
                router.refresh();
            } else {
                toast.error(result.error || "Không thể xóa đạo diễn");
            }
        });
    };

    const openDeleteDialog = (director: Director) => {
        setSelectedDirector(director);
        setDeleteDialogOpen(true);
    };

    const formatDate = (timestamp: string | null) => {
        if (!timestamp) return "-";
        const date = new Date(timestamp);
        return date.toLocaleDateString("vi-VN");
    };

    const columns: Column<Director>[] = [
        {
            key: "name",
            title: "Tên đạo diễn",
            sortable: true,
            hideable: false,
            render: (director: Director) => (
                <span className="font-medium">{director.name}</span>
            ),
        },
        {
            key: "gender",
            title: "Giới tính",
            sortable: true,
            hideable: true,
            render: (director: Director) => (
                director.gender ? (
                    <Badge variant={director.gender === "male" ? "default" : "secondary"}>
                        {director.gender === "male" ? "Nam" : "Nữ"}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )
            ),
        },
        {
            key: "nationality",
            title: "Quốc tịch",
            sortable: true,
            hideable: true,
            render: (director: Director) => (
                <span className="text-muted-foreground">{director.nationality || "-"}</span>
            ),
        },
        {
            key: "birthDate",
            title: "Ngày sinh",
            sortable: true,
            hideable: true,
            render: (director: Director) => (
                <span className="text-sm text-muted-foreground">
                    {formatDate(director.birthDate)}
                </span>
            ),
        },
        {
            key: "createdAt",
            title: "Ngày tạo",
            sortable: true,
            hideable: true,
            render: (director: Director) => (
                <span className="text-sm text-muted-foreground">
                    {formatDate(director.createdAt)}
                </span>
            ),
        },
        {
            key: "actions",
            title: "",
            className: "w-[70px]",
            hideable: false,
            render: (director: Director) => (
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
                                onEdit(director);
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
                                openDeleteDialog(director);
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
                emptyMessage="Không có đạo diễn nào"
                isLoading={isPending}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này sẽ xóa vĩnh viễn đạo diễn &quot;
                            {selectedDirector?.name}&quot;. Không thể hoàn tác sau khi xóa.
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
