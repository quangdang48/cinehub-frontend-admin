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
import { MoreHorizontal, Trash2, ThumbsUp, ThumbsDown, MessageSquare, Star, AlertTriangle } from "lucide-react";
import { deleteReview } from "../actions";
import type { Review, ReviewReport } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableWrapper, type Column } from "@/components/shared/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { PaginatedApiResponse } from "@/types/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { normalizeUrl } from "@/lib/utils";

interface ReviewTableProps {
    data: PaginatedApiResponse<Review>;
}

export function ReviewTable({ data }: ReviewTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

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
        defaultVisibleColumns: ["author", "content", "rating", "stats", "reports", "createdAt", "actions"],
        baseUrl: "/reviews",
    });

    const handleDelete = async () => {
        if (!selectedReview) return;

        startTransition(async () => {
            const result = await deleteReview(selectedReview.id);

            if (result.success) {
                toast.success("Xóa đánh giá thành công");
                setDeleteDialogOpen(false);
                setSelectedReview(null);
                router.refresh();
            } else {
                toast.error(result.error || "Không thể xóa đánh giá");
            }
        });
        setDeleteDialogOpen(false);
        setReportDialogOpen(false);
    };

    const openDeleteDialog = (review: Review) => {
        setSelectedReview(review);
        setDeleteDialogOpen(true);
    };

    const openReportDialog = (review: Review) => {
        setSelectedReview(review);
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

    const columns: Column<Review>[] = [
        {
            key: "author",
            title: "Người dùng",
            hideable: false,
            render: (review: Review) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={review.author.avatarUrl ? normalizeUrl(review.author.avatarUrl) : undefined} />
                        <AvatarFallback>{getInitials(review.author.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-sm">{review.author.name}</p>
                        <p className="text-xs text-muted-foreground">{review.author.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "content",
            title: "Nội dung",
            hideable: false,
            render: (review: Review) => (
                <div className="max-w-md">
                    <p className="text-sm line-clamp-2">{review.content}</p>
                </div>
            ),
        },
        {
            key: "rating",
            title: "Đánh giá",
            render: (review: Review) => (
                <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{review.rating}</span>
                </div>
            ),
        },
        {
            key: "stats",
            title: "Tương tác",
            hideable: true,
            render: (review: Review) => (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {review.totalLikes}
                    </span>
                    <span className="flex items-center gap-1">
                        <ThumbsDown className="h-3.5 w-3.5" />
                        {review.totalDislikes}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {review.totalComments}
                    </span>
                </div>
            ),
        },
        {
            key: "reports",
            title: "Báo cáo",
            render: (review: Review) => (
                review.isReported ? (
                    <Badge 
                        variant="destructive"
                        className="cursor-pointer hover:bg-destructive/80"
                        onClick={() => openReportDialog(review)}
                    >
                        {review.reports.length} báo cáo
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                        Sạch
                    </Badge>
                )
            ),
        },
        {
            key: "createdAt",
            title: "Ngày tạo",
            render: (review: Review) => (
                <span className="text-sm text-muted-foreground">
                    {formatDate(review.createdAt)}
                </span>
            ),
        },
        {
            key: "actions",
            title: "Thao tác",
            render: (review: Review) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => openDeleteDialog(review)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa đánh giá
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <>
            <DataTableWrapper
                columns={columns}
                data={data}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                sortConfig={sortConfig}
                onSort={handleSort}
                visibleColumns={visibleColumns}
                onToggleColumn={toggleColumn}
                isLoading={isPending}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Đánh giá này sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                            {selectedReview?.reports.map((report: ReviewReport) => (
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
                            {selectedReview?.reports.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">
                                    Không có báo cáo nào
                                </p>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
