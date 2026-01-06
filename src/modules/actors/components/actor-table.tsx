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
import { deleteActor } from "../actions";
import type { Actor } from "../types";
import { Button } from "@/components/ui/button";
import { DataTableWrapper, type Column } from "@/components/shared/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { PaginatedApiResponse } from "@/types/api";
import { Badge } from "@/components/ui/badge";

interface ActorTableProps {
    data: PaginatedApiResponse<Actor>;
    onEdit: (actor: Actor) => void;
}

export function ActorTable({ data, onEdit }: ActorTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedActor, setSelectedActor] = useState<Actor | null>(null);

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
        baseUrl: "/actors",
    });

    const handleDelete = async () => {
        if (!selectedActor) return;

        startTransition(async () => {
            const result = await deleteActor(selectedActor.id);

            if (result.success) {
                toast.success("Xóa diễn viên thành công");
                setDeleteDialogOpen(false);
                setSelectedActor(null);
                router.refresh();
            } else {
                toast.error(result.error || "Không thể xóa diễn viên");
            }
        });
    };

    const openDeleteDialog = (actor: Actor) => {
        setSelectedActor(actor);
        setDeleteDialogOpen(true);
    };

    const formatDate = (timestamp: string | null) => {
        if (!timestamp) return "-";
        const date = new Date(timestamp);
        return date.toLocaleDateString("vi-VN");
    };

    const columns: Column<Actor>[] = [
        {
            key: "name",
            title: "Tên diễn viên",
            sortable: true,
            hideable: false,
            render: (actor: Actor) => (
                <span className="font-medium">{actor.name}</span>
            ),
        },
        {
            key: "gender",
            title: "Giới tính",
            sortable: true,
            hideable: true,
            render: (actor: Actor) => (
                actor.gender ? (
                    <Badge variant={actor.gender === "male" ? "default" : "secondary"}>
                        {actor.gender === "male" ? "Nam" : "Nữ"}
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
            render: (actor: Actor) => (
                <span className="text-muted-foreground">{actor.nationality || "-"}</span>
            ),
        },
        {
            key: "birthDate",
            title: "Ngày sinh",
            sortable: true,
            hideable: true,
            render: (actor: Actor) => (
                <span className="text-sm text-muted-foreground">
                    {formatDate(actor.birthDate)}
                </span>
            ),
        },
        {
            key: "createdAt",
            title: "Ngày tạo",
            sortable: true,
            hideable: true,
            render: (actor: Actor) => (
                <span className="text-sm text-muted-foreground">
                    {formatDate(actor.createdAt)}
                </span>
            ),
        },
        {
            key: "actions",
            title: "",
            className: "w-[70px]",
            hideable: false,
            render: (actor: Actor) => (
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
                                onEdit(actor);
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
                                openDeleteDialog(actor);
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
                emptyMessage="Không có diễn viên nào"
                isLoading={isPending}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này sẽ xóa vĩnh viễn diễn viên &quot;
                            {selectedActor?.name}&quot;. Không thể hoàn tác sau khi xóa.
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
