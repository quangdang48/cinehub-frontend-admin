"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserDto } from "@/modules/auth/types";
import { updateProfileSchema, changePasswordSchema } from "@/modules/auth/schemas";
import { updateProfile, changePassword } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { Field, FieldError, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { normalizeUrl } from "@/lib/utils";

interface ProfilePageClientProps {
  user: UserDto;
}

export function ProfilePageClient({ user }: ProfilePageClientProps) {
  const [isPending, startTransition] = useTransition();
  const { update } = useSession();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview !== user.avatarUrl && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview, user.avatarUrl]);

  const profileForm = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema as any),
    defaultValues: {
      name: user.name,
      gender: user.gender,
    },
    mode: "onSubmit",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (file: File) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      fieldChange(file); 
      setAvatarPreview(URL.createObjectURL(file));
      e.target.value = "";
    }
  };

  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema as any),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = (values: z.infer<typeof updateProfileSchema>) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("gender", values.gender);
        if (values.avatar) {
          formData.append("avatar", values.avatar);
        }
        const updatedUser = await updateProfile(user.id, formData);
        update({
            name: updatedUser.name,
            gender: updatedUser.gender,
            avatarUrl: updatedUser.avatarUrl,
        })
        toast.success("Cập nhật thông tin thành công");
      } catch (error: any) {
        toast.error(error.message || "Cập nhật thông tin thất bại");
      }
    });
  };

  const onPasswordSubmit = (data: z.infer<typeof changePasswordSchema>) => {
    startTransition(async () => {
      try {
        await changePassword(data);
        toast.success("Đổi mật khẩu thành công");
        passwordForm.reset();
      } catch (error: any) {
        toast.error(error.message || "Đổi mật khẩu thất bại");
      }
    });
  };

  return (
    <div className="container mx-auto py-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Hồ sơ cá nhân</h1>
      
      <Tabs defaultValue="profile" className="w-full max-w-3xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Xem và chỉnh sửa thông tin cá nhân của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <Controller
                  name="avatar"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <Avatar className="h-28 w-28 border-2 border-border">
                            <AvatarImage src={avatarPreview ? normalizeUrl(avatarPreview) : "https://github.com/shadcn.png"} alt={user.name || ""} />
                            <AvatarFallback className="text-2xl font-bold bg-muted">
                              {user.name?.charAt(0).toUpperCase()}
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
                          ref={fileInputRef}
                          onChange={(e) => handleFileChange(e, field.onChange)}
                        />
                        <div className="text-center">
                          <p className="text-sm font-medium text-primary cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
                            Thay đổi ảnh đại diện
                          </p>
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </div>
                    </Field>
                  )}
                />

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" value={user.email} disabled />
                </Field>
                
                <Controller
                  name="name"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Họ và tên</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="Nhập họ và tên"
                        aria-invalid={fieldState.invalid}
                        autoComplete="name"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="gender"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Giới tính</FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? "male"}>
                        <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>
                Thay đổi mật khẩu đăng nhập của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <Controller
                  name="oldPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Mật khẩu hiện tại</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="password"
                        placeholder="Nhập mật khẩu hiện tại"
                        aria-invalid={fieldState.invalid}
                        autoComplete="current-password"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                
                <Controller
                  name="newPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Mật khẩu mới</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                      />
                      <FieldDescription>
                        Mật khẩu phải có ít nhất 8 ký tự.
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                
                <Controller
                  name="confirmPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Xác nhận mật khẩu mới</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        aria-invalid={fieldState.invalid}
                        autoComplete="new-password"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Đang lưu..." : "Đổi mật khẩu"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
