"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { MoreHorizontal, Trash2, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { deleteComment } from "../actions";
import type { Comment } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableWrapper, type Column } from "@/components/shared/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { PaginatedApiResponse } from "@/types/api";

interface CommentTableProps {
    data: PaginatedApiResponse<Comment>;
}

export function CommentTable({ data }: CommentTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

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
        defaultVisibleColumns: ["author", "content", "stats", "episode", "createdAt", "actions"],
        baseUrl: "/comments",
    });

    const handleDelete = async () => {
        if (!selectedComment) return;

        startTransition(async () => {
            const result = await deleteComment(selectedComment.id);

            if (result.success) {
                toast.success("Xóa bình luận thành công");
                setDeleteDialogOpen(false);
                setSelectedComment(null);
                router.refresh();
            } else {
                toast.error(result.error || "Không thể xóa bình luận");
            }
        });
    };

    const openDeleteDialog = (comment: Comment) => {
        setSelectedComment(comment);
        setDeleteDialogOpen(true);
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString("vi-VN");
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const columns: Column<Comment>[] = [
        {
            key: "author",
            title: "Người dùng",
            hideable: false,
            render: (comment: Comment) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-sm">{comment.author.name}</p>
                        <p className="text-xs text-muted-foreground">{comment.author.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "content",
            title: "Nội dung",
            hideable: false,
            render: (comment: Comment) => (
                <div className="max-w-md">
                    <p className="text-sm line-clamp-2">{comment.content}</p>
                    {comment.parentId && (
                        <Badge variant="outline" className="mt-1 text-xs">
                            Trả lời
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            key: "stats",
            title: "Tương tác",
            hideable: true,
            render: (comment: Comment) => (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {comment.totalLikes}
                    </span>
                    <span className="flex items-center gap-1">
                        <ThumbsDown className="h-3.5 w-3.5" />
                        {comment.totalDislikes}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {comment.totalReplies}
                    </span>
                </div>
            ),
        },
        {
            key: "episode",
            title: "Mùa/Tập",
            hideable: true,
            render: (comment: Comment) => (
                <span className="text-sm text-muted-foreground">
                    {comment.season && comment.episode
                        ? `S${comment.season}E${comment.episode}`
                        : "-"}
                </span>
            ),
        },
        {
            key: "createdAt",
            title: "Thời gian",
            sortable: true,
            hideable: true,
            render: (comment: Comment) => (
                <span className="text-sm text-muted-foreground">
                    {formatDate(comment.createdAt)}
                </span>
            ),
        },
        {
            key: "actions",
            title: "",
            className: "w-[70px]",
            hideable: false,
            render: (comment: Comment) => (
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
                            className="text-red-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(comment);
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa bình luận
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
                emptyMessage="Không có bình luận nào"
                isLoading={isPending}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này sẽ xóa vĩnh viễn bình luận của{" "}
                            {selectedComment?.author.name}. Không thể hoàn tác sau khi xóa.
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
