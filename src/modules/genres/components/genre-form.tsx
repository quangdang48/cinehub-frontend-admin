"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGenre, updateGenre } from "../actions";
import type { Genre } from "../types";

interface GenreFormData {
    name: string;
}

interface GenreFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    genre?: Genre | null;
    onSuccess?: () => void;
}

export function GenreForm({ open, onOpenChange, genre, onSuccess }: GenreFormProps) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!genre;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<GenreFormData>({
        defaultValues: {
            name: genre?.name || "",
        },
    });

    useEffect(() => {
        if (open) {
            reset({ name: genre?.name || "" });
        }
    }, [open, genre, reset]);

    const onSubmit = (data: GenreFormData) => {
        startTransition(async () => {
            const result = isEditing
                ? await updateGenre(genre.id, data)
                : await createGenre(data);

            if (result.success) {
                toast.success(isEditing ? "Cập nhật thành công" : "Tạo mới thành công");
                reset();
                onOpenChange(false);
                onSuccess?.();
            } else {
                toast.error(result.error || "Có lỗi xảy ra");
            }
        });
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            reset();
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Chỉnh sửa thể loại" : "Thêm thể loại mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Cập nhật thông tin thể loại phim."
                            : "Thêm thể loại phim mới vào hệ thống."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Tên thể loại <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                placeholder="Nhập tên thể loại..."
                                {...register("name", { required: "Tên thể loại không được để trống" })}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
                            disabled={isPending}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
