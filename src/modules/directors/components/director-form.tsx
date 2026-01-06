"use client";

import { useTransition, useEffect, useState, useRef } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { normalizeUrl } from "@/lib/utils";
import { createDirector, updateDirector } from "../actions";
import type { Director } from "../types";

interface DirectorFormData {
    name: string;
    gender: "male" | "female" | "";
    bio: string;
    birthDate: string;
    nationality: string;
    photo?: FileList;
}

interface DirectorFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    director?: Director | null;
    onSuccess?: () => void;
}

export function DirectorForm({ open, onOpenChange, director, onSuccess }: DirectorFormProps) {
    const [isPending, startTransition] = useTransition();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(director?.photoUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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
            setAvatarPreview(director?.photoUrl || null);
        }
    }, [open, director, reset]);

    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview !== director?.photoUrl && avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview, director?.photoUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = (data: DirectorFormData) => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("name", data.name);
            if (data.gender) formData.append("gender", data.gender);
            if (data.bio) formData.append("bio", data.bio);
            if (data.birthDate) formData.append("birthDate", data.birthDate);
            if (data.nationality) formData.append("nationality", data.nationality);
            if (data.photo && data.photo.length > 0) {
                formData.append("photo", data.photo[0]);
            }

            const result = isEditing
                ? await updateDirector(director.id, formData)
                : await createDirector(formData);

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
            <DialogContent className="sm:max-w-125">
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
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Avatar className="h-28 w-28 border-2 border-border">
                                    <AvatarImage src={avatarPreview ? normalizeUrl(avatarPreview) : ""} alt={watch("name") || ""} />
                                    <AvatarFallback className="text-2xl font-bold bg-muted">
                                        {watch("name")?.charAt(0).toUpperCase() || "D"}
                                    </AvatarFallback>
                                </Avatar>
                                {/* Overlay icon Camera */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                {...register("photo", {
                                    onChange: handleFileChange
                                })}
                                ref={(e) => {
                                    register("photo").ref(e);
                                    fileInputRef.current = e;
                                }}
                            />
                            <div className="text-center">
                                <p className="text-sm font-medium text-primary cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
                                    {isEditing ? "Thay đổi ảnh đại diện" : "Thêm ảnh đại diện"}
                                </p>
                            </div>
                        </div>

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
