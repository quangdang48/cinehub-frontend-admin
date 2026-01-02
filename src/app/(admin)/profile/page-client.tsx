"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserDto } from "@/modules/auth/types";
import { updateProfileSchema, changePasswordSchema } from "@/modules/auth/schemas";
import { updateProfile, changePassword } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";

interface ProfilePageClientProps {
  user: UserDto;
}

export function ProfilePageClient({ user }: ProfilePageClientProps) {
  const [isPending, startTransition] = useTransition();
  const { data: session, update } = useSession();

  const profileForm = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema as any),
    defaultValues: {
      name: user.name,
      gender: user.gender,
    },
  });

  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema as any),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = (data: z.infer<typeof updateProfileSchema>) => {
    startTransition(async () => {
      try {
        const updatedUser = await updateProfile(user.id, data);
        update({
            name: updatedUser.name,
            gender: updatedUser.gender,
        })
        toast.success("Cập nhật thông tin thành công");
      } catch (error) {
        toast.error("Cập nhật thông tin thất bại");
      }
    });
  };

  const onPasswordSubmit = (data: z.infer<typeof changePasswordSchema>) => {
    startTransition(async () => {
      try {
        await changePassword(data);
        toast.success("Đổi mật khẩu thành công");
        passwordForm.reset();
      } catch (error) {
        toast.error("Đổi mật khẩu thất bại");
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
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" {...profileForm.register("name")} />
                  {profileForm.formState.errors.name && (
                    <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  <Select 
                    onValueChange={(value) => profileForm.setValue("gender", value as "male" | "female")}
                    defaultValue={user.gender}
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

                <Button type="submit" disabled={isPending}>
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
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
                  <Input id="oldPassword" type="password" {...passwordForm.register("oldPassword")} />
                  {passwordForm.formState.errors.oldPassword && (
                    <p className="text-sm text-red-500">{passwordForm.formState.errors.oldPassword.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isPending}>
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
