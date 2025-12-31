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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateUser } from "../actions";
import type { User, UpdateUserDto } from "../types";
import { Gender } from "../types";

interface UserFormData {
    name: string;
    email: string;
    gender: Gender;
}

interface UserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    onSuccess?: () => void;
}

export function UserForm({ open, onOpenChange, user, onSuccess }: UserFormProps) {
    const [isPending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<UserFormData>({
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            gender: user?.gender || Gender.MALE,
        },
    });

    const gender = watch("gender");

    useEffect(() => {
        if (open && user) {
            reset({
                name: user.name,
                email: user.email,
                gender: user.gender || Gender.MALE,
            });
        }
    }, [open, user, reset]);

    const onSubmit = (data: UserFormData) => {
        if (!user) return;

        startTransition(async () => {
            const updateData: UpdateUserDto = {
                name: data.name,
                email: data.email,
                gender: data.gender,
            };

            const result = await updateUser(user.id, updateData);

            if (result.success) {
                toast.success("Cập nhật người dùng thành công");
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
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin người dùng trong hệ thống.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Họ tên <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Nhập họ tên..."
                                {...register("name", {
                                    required: "Họ tên không được để trống",
                                })}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Nhập email..."
                                {...register("email", {
                                    required: "Email không được để trống",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Email không hợp lệ",
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="gender">
                                Giới tính <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={gender}
                                onValueChange={(value: Gender) => setValue("gender", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn giới tính" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Nam</SelectItem>
                                    <SelectItem value="female">Nữ</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && (
                                <p className="text-sm text-red-500">{errors.gender.message}</p>
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
                            {isPending ? "Đang xử lý..." : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
