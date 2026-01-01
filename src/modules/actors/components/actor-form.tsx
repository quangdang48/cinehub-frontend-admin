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
import { createActor, updateActor } from "../actions";
import type { Actor } from "../types";

interface ActorFormData {
    name: string;
    gender: "male" | "female" | "";
    bio: string;
    birthDate: string;
    nationality: string;
}

interface ActorFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    actor?: Actor | null;
    onSuccess?: () => void;
}

export function ActorForm({ open, onOpenChange, actor, onSuccess }: ActorFormProps) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!actor;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ActorFormData>({
        defaultValues: {
            name: actor?.name || "",
            gender: actor?.gender || "",
            bio: actor?.bio || "",
            birthDate: actor?.birthDate ? actor.birthDate.split("T")[0] : "",
            nationality: actor?.nationality || "",
        },
    });

    const genderValue = watch("gender");

    useEffect(() => {
        if (open) {
            reset({
                name: actor?.name || "",
                gender: actor?.gender || "",
                bio: actor?.bio || "",
                birthDate: actor?.birthDate ? actor.birthDate.split("T")[0] : "",
                nationality: actor?.nationality || "",
            });
        }
    }, [open, actor, reset]);

    const onSubmit = (data: ActorFormData) => {
        startTransition(async () => {
            const payload = {
                name: data.name,
                gender: data.gender || null,
                bio: data.bio || null,
                birthDate: data.birthDate || null,
                nationality: data.nationality || null,
            };

            const result = isEditing
                ? await updateActor(actor.id, payload)
                : await createActor(payload);

            if (result.success) {
                toast.success(isEditing ? "Cập nhật diễn viên thành công" : "Thêm diễn viên thành công");
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
                        {isEditing ? "Chỉnh sửa diễn viên" : "Thêm diễn viên mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Cập nhật thông tin diễn viên."
                            : "Thêm diễn viên mới vào hệ thống."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Tên diễn viên <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                placeholder="Nhập tên diễn viên..."
                                {...register("name", { required: "Tên diễn viên không được để trống" })}
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
                                placeholder="Nhập tiểu sử diễn viên..."
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
