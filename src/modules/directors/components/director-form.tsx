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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createDirector, updateDirector } from "../actions";
import type { Director } from "../types";

interface DirectorFormData {
    name: string;
    gender: "male" | "female" | "";
    bio: string;
    birthDate: string;
    nationality: string;
}

interface DirectorFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    director?: Director | null;
    onSuccess?: () => void;
}

export function DirectorForm({ open, onOpenChange, director, onSuccess }: DirectorFormProps) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!director;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<DirectorFormData>({
        defaultValues: {
            name: director?.name || "",
            gender: director?.gender || "",
            bio: director?.bio || "",
            birthDate: director?.birthDate ? director.birthDate.split("T")[0] : "",
            nationality: director?.nationality || "",
        },
    });

    const genderValue = watch("gender");

    useEffect(() => {
        if (open) {
            reset({
                name: director?.name || "",
                gender: director?.gender || "",
                bio: director?.bio || "",
                birthDate: director?.birthDate ? director.birthDate.split("T")[0] : "",
                nationality: director?.nationality || "",
            });
        }
    }, [open, director, reset]);

    const onSubmit = (data: DirectorFormData) => {
        startTransition(async () => {
            const payload = {
                name: data.name,
                gender: data.gender || null,
                bio: data.bio || null,
                birthDate: data.birthDate || null,
                nationality: data.nationality || null,
            };

            const result = isEditing
                ? await updateDirector(director.id, payload)
                : await createDirector(payload);

            if (result.success) {
                toast.success(isEditing ? "Cập nhật đạo diễn thành công" : "Thêm đạo diễn thành công");
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Chỉnh sửa đạo diễn" : "Thêm đạo diễn mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Cập nhật thông tin đạo diễn."
                            : "Thêm đạo diễn mới vào hệ thống."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Tên đạo diễn <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                placeholder="Nhập tên đạo diễn..."
                                {...register("name", { required: "Tên đạo diễn không được để trống" })}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="gender">Giới tính</Label>
                                <Select
                                    value={genderValue}
                                    onValueChange={(value) => setValue("gender", value as "male" | "female" | "")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn giới tính" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Nam</SelectItem>
                                        <SelectItem value="female">Nữ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="birthDate">Ngày sinh</Label>
                                <Input
                                    id="birthDate"
                                    type="date"
                                    {...register("birthDate")}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="nationality">Quốc tịch</Label>
                            <Input
                                id="nationality"
                                placeholder="Nhập quốc tịch..."
                                {...register("nationality")}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Tiểu sử</Label>
                            <Textarea
                                id="bio"
                                placeholder="Nhập tiểu sử đạo diễn..."
                                rows={3}
                                {...register("bio")}
                            />
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
