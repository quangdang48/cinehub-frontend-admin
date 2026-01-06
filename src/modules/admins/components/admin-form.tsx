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
import { createAdmin, updateAdmin } from "../actions";
import type { Admin, CreateAdminDto, UpdateAdminDto } from "../types";
import { Gender } from "../types";

interface AdminFormData {
    name: string;
    email: string;
    gender: Gender;
    password?: string;
}

interface AdminFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    admin?: Admin | null;
    onSuccess?: () => void;
}

export function AdminForm({ open, onOpenChange, admin, onSuccess }: AdminFormProps) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!admin;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AdminFormData>({
        defaultValues: {
            name: admin?.name || "",
            email: admin?.email || "",
            gender: admin?.gender || Gender.MALE,
            password: "",
        },
    });

    const gender = watch("gender");

    useEffect(() => {
        if (open) {
            reset({
                name: admin?.name || "",
                email: admin?.email || "",
                gender: admin?.gender || Gender.MALE,
                password: "",
            });
        }
    }, [open, admin, reset]);

    const onSubmit = (data: AdminFormData) => {
        startTransition(async () => {
            if (isEditing) {
                const updateData: UpdateAdminDto = {
                    name: data.name,
                    email: data.email,
                    gender: data.gender,
                };

                const result = await updateAdmin(admin.id, updateData);

                if (result.success) {
                    toast.success("Cập nhật admin thành công");
                    reset();
                    onOpenChange(false);
                    onSuccess?.();
                } else {
                    toast.error(result.error || "Có lỗi xảy ra");
                }
            } else {
                if (!data.password) {
                    toast.error("Vui lòng nhập mật khẩu");
                    return;
                }

                const createData: CreateAdminDto = {
                    name: data.name,
                    email: data.email,
                    gender: data.gender,
                    password: data.password,
                };

                const result = await createAdmin(createData);

                if (result.success) {
                    toast.success("Tạo admin mới thành công");
                    reset();
                    onOpenChange(false);
                    onSuccess?.();
                } else {
                    toast.error(result.error || "Có lỗi xảy ra");
                }
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
                    <DialogTitle>
                        {isEditing ? "Chỉnh sửa admin" : "Thêm admin mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Cập nhật thông tin quản trị viên."
                            : "Thêm quản trị viên mới vào hệ thống."}
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

                        {!isEditing && (
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Nhập mật khẩu..."
                                    {...register("password", {
                                        required: !isEditing && "Mật khẩu không được để trống",
                                        minLength: {
                                            value: 8,
                                            message: "Mật khẩu phải có ít nhất 8 ký tự",
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                                            message:
                                                "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
                                        },
                                    })}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">
                                        {errors.password.message}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường,
                                    số và ký tự đặc biệt.
                                </p>
                            </div>
                        )}
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
                            {isPending
                                ? "Đang xử lý..."
                                : isEditing
                                    ? "Cập nhật"
                                    : "Tạo mới"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
