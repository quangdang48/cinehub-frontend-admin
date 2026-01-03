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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { MoreHorizontal, Trash2, ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle } from "lucide-react";
import { deleteComment } from "../actions";
import type { Comment, CommentReport } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableWrapper, type Column } from "@/components/shared/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { PaginatedApiResponse } from "@/types/api";
import { normalizeUrl } from "@/lib/utils";

interface CommentTableProps {
    data: PaginatedApiResponse<Comment>;
}

export function CommentTable({ data }: CommentTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);

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
        defaultVisibleColumns: ["author", "content", "stats", "reports", "episode", "createdAt", "actions"],
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

    const openReportDialog = (comment: Comment) => {
        setSelectedComment(comment);
        setReportDialogOpen(true);
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
                        <AvatarImage src={comment.author.avatarUrl ? normalizeUrl(comment.author.avatarUrl) : undefined} />
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
            key: "reports",
            title: "Báo cáo",
            render: (comment: Comment) => (
                comment.isReported ? (
                    <Badge 
                        variant="destructive"
                        className="cursor-pointer hover:bg-destructive/30"
                        onClick={() => openReportDialog(comment)}
                    >
                        {comment.reports.length} báo cáo
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                        Sạch
                    </Badge>
                )
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
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Chi tiết báo cáo</DialogTitle>
                        <DialogDescription>
                            Danh sách các báo cáo cho bình luận này
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-4 p-1">
                            {selectedComment?.reports.map((report: CommentReport) => (
                                <div key={report.id} className="rounded-lg border p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className="font-medium">
                                            {report.reason}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(report.createdAt)}
                                        </span>
                                    </div>
                                    {report.description && (
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {report.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t">
                                        <AlertTriangle className="h-3 w-3" />
                                        <span>Người báo cáo: {report.user.name}</span>
                                    </div>
                                </div>
                            ))}
                            {selectedComment?.reports.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">
                                    Không có báo cáo nào
                                </p>
                            )}
                        </div>
                        <Button
                            variant={'destructive'}
                            className="mt-2 w-auto"
                            onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(selectedComment!);
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa bình luận
                        </Button>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
